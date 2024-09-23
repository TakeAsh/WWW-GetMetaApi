package WWW::GetMetaApi;
use 5.010;
use strict;
use warnings;
use utf8;
use feature qw(say);
use Encode;
use Exporter 'import';
use YAML::Syck qw(LoadFile DumpFile Dump);
use JSON::XS;
use LWP::UserAgent;
use HTTP::CookieJar::LWP ();
use File::Slurp          qw(read_file write_file);
use File::Share ':all';
use HTML::Entities;
use FindBin::libs "Bin=${FindBin::RealBin}";
use open ':std' => ':utf8';

use version 0.77; our $VERSION = version->declare("v0.0.1");

$YAML::Syck::ImplicitUnicode = 1;

our @EXPORT = qw(getMeta getMetaFromContent removeAgitations);

my $default_header = {
    USER_AGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ACCEPT          => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    ACCEPT_ENCODING => 'gzip, deflate, br, zstd',
    ACCEPT_LANGUAGE => 'ja,en-US;q=0.9,en;q=0.8',
};

my $json          = JSON::XS->new->utf8(0)->pretty->canonical->allow_nonref(1);
my $dirConf       = dist_dir('WWW-GetMetaApi') . '/conf';
my $jar           = HTTP::CookieJar::LWP->new->load_cookies( readFileTrim('cookies.txt') );
my @regAgitations = map { eval($_) } readFileTrim('agitations.txt');
my $agent         = LWP::UserAgent->new(
    keep_alive            => 4,
    timeout               => 60,
    requests_redirectable => [ 'GET', 'HEAD' ],
    cookie_jar            => $jar,
);
my $regNoAcceptEncodingDomains
    = join( '|', map { quotemeta($_) } readFileTrim('NoAcceptEncodingDomains.txt') );

sub getMeta {
    my $query  = shift || {};
    my $uris   = shift;
    my $client = getClientInfo();
    $agent->agent( $client->{'HTTP_USER_AGENT'} || $default_header->{'USER_AGENT'} );
    my @forwarded = ();
    if ( $client->{'HTTP_X_FORWARDED_FOR'} ) {
        warn( 'HTTP_X_FORWARDED_FOR: ' . $client->{'HTTP_X_FORWARDED_FOR'} . "\n" );
        push( @forwarded, split( /\s*,\s*/, $client->{'HTTP_X_FORWARDED_FOR'} ) );
    }
    if ( $client->{'HTTP_FORWARDED'} ) {
        warn( 'HTTP_FORWARDED: ' . $client->{'HTTP_FORWARDED'} . "\n" );
        push( @forwarded, $client->{'HTTP_FORWARDED'} =~ /for=([^,;]+)/g );
    }
    push( @forwarded, $client->{'CLIENT_IP'} );
    warn( 'Forwarded: ' . join( ", ", @forwarded ) . "\n" );
    $agent->default_header( 'X-Forwarded-For' => join( ', ', @forwarded ) );
    $agent->default_header( 'Forwarded'       => join( ', ', map {"for=$_"} @forwarded ) );
    $agent->default_header( 'Accept'          => $default_header->{'ACCEPT'} );
    $agent->default_header( 'Referer'         => $client->{'HTTP_REFERER'} || '' );
    my $acceptLanguage = $client->{'HTTP_ACCEPT_LANGUAGE'} || $default_header->{'ACCEPT_LANGUAGE'};
    $agent->default_header( 'Accept-Language' => $acceptLanguage );
    my $acceptEncoding = $client->{'HTTP_ACCEPT_ENCODING'} || $default_header->{'ACCEPT_ENCODING'};
    my $checkAcceptEncodingDomains
        = sub { return shift =~ /$regNoAcceptEncodingDomains/ ? undef : $acceptEncoding };
    my $isDebug = !$client->{'CLIENT_IP'} || $client->{'CLIENT_IP'} eq ( $ENV{'IP_DEBUG'} || '' );
    my $metas   = {};

    foreach my $uri ( splitUris( @{$uris} ) ) {
        $agent->default_header( 'Accept-Encoding' => $checkAcceptEncodingDomains->($uri) );
        my $response = $agent->get($uri);
        $metas->{$uri} = getMetaFromContent( $response->decoded_content );
        if ($isDebug) {
            my %headers = %{ $agent->default_headers() };
            $metas->{$uri}{'_headers'} = { map { $_ => $headers{$_} || undef } keys(%headers) };
            $metas->{$uri}{'_content'} = $response->decoded_content;
        }
    }
    return $json->encode(
        {   metas  => $metas,
            query  => $query,
            client => $client,
        }
    );
}

sub trim {
    my $str = shift or return '';
    $str =~ s/^\s+//;
    $str =~ s/\s+$//;
    return $str;
}

sub startsWith {
    my $text   = shift or return;
    my $prefix = shift or return;
    return $prefix eq substr( $text, 0, length($prefix) );
}

sub readFileTrim {
    my $file = shift or return ();
    return grep {$_} map { trim($_) } read_file( "${dirConf}/${file}", { binmode => ':utf8' } );
}

sub getClientInfo {
    my $client = { map { $_ => $ENV{$_} } grep { isValidEnv($_) } keys(%ENV) };
    $client->{'CLIENT_IP'}
        = $client->{'HTTP_X_FORWARDED_FOR'}
        || $client->{'HTTP_CLIENT_IP'}
        || $client->{'HTTP_FORWARDED'}
        || $client->{'REMOTE_ADDR'}
        || '';
    return $client;
}

sub isValidEnv {
    my $key = shift or return;
    return
           startsWith( $key, 'HTTP' )
        || startsWith( $key, 'REMOTE' )
        || startsWith( $key, 'REQUEST' );
}

sub splitUris {
    my %uris = map { trim($_) => 1; } map { split( /\n/, $_ ) } @_;
    return sort( keys(%uris) );
}

sub trim_decode {
    return trim( decode_entities( shift || '' ) );
}

sub getMetaFromContent {
    my $content = shift or return undef;
    my $meta    = {};
    $content =~ /<head(\s+[^>]+)?>(?<head>[\S\s]+?)<\/head>/;
    my $head = $+{'head'} || '';
    $meta->{'title'} = getTitle($head) || getTitle($content) || '';
    $head =~ s/<script[^>]*>[\S\s]*?<\/script>//g;
    while (
        $head =~ /<meta [^><]*?\s
        content="(?<content>[^"]+)" [^><]*?\s
        (name|property)="(?<name>[^"]+)" [^>]*
        \/?>/gx
        )
    {
        $meta->{ trim_decode( $+{'name'} ) } = trim_decode( $+{'content'} );
    }
    while (
        $head =~ /<meta [^><]*?\s
        (name|property)="(?<name>[^"]+)" [^><]*?\s
        content="(?<content>[^"]+)" [^>]*
        \/?>/gx
        )
    {
        $meta->{ trim_decode( $+{'name'} ) } = trim_decode( $+{'content'} );
    }
    $meta->{'_title'}
        = removeAgitations( $meta->{'twitter:title'}
            || $meta->{'og:title'}
            || $meta->{'title'}
            || '' );
    $meta->{'_description'}
        = removeAgitations( $meta->{'twitter:description'}
            || $meta->{'og:description'}
            || $meta->{'description'}
            || '' );
    $meta->{'_image'} = $meta->{'twitter:image'} || $meta->{'og:image'} || '';
    return $meta;
}

sub getTitle {
    my $text = shift or return;
    $text =~ /<title[^>]*>(?<title>[\S\s]+?)<\/title>/;
    return trim_decode( $+{'title'} );
}

sub removeAgitations {
    my $text = shift or return '';
    foreach my $reg (@regAgitations) {
        $text =~ s/$reg//;
    }
    return $text;
}

1;

__END__

=encoding utf-8

=head1 NAME

WWW::GetMetaApi - Gets the meta data on other web sites, and can be called from *.user.js

=head1 SYNOPSIS

    use WWW::GetMetaApi;

=head1 DESCRIPTION

WWW::GetMetaApi is an api to be used from some user scripts, and return the meta data of other web sites.

=head1 LICENSE

Copyright (C) TakeAsh.

This library is free software; you can redistribute it and/or modify
it under the same terms as Perl itself.

=head1 AUTHOR

L<TakeAsh68k|https://github.com/TakeAsh/>

=cut
