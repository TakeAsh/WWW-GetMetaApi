#!/usr/bin/perl

use strict;
use warnings;
use utf8;
use feature qw(say);
use Encode;
use YAML::Syck qw(LoadFile Dump DumpFile);
use CGI;
use FindBin::libs "Bin=${FindBin::RealBin}";
use WWW::GetMetaApi;
use Term::Encoding qw(term_encoding);
use open ':std' => ':utf8';

$|                           = 1;
$YAML::Syck::ImplicitUnicode = 1;

my $q = new CGI;
$q->charset('UTF-8');
my $query    = { map { $_ => [ $q->multi_param($_) ]; } $q->multi_param() };
my $uris     = [ $q->multi_param('uri') ];
my $callback = $q->param('callback') || '';
my $metas    = getMeta( $query, $uris );
my $body
    = $callback
    ? "${callback}(${metas})"
    : $metas;
print $q->header(
    -type => $callback
    ? 'application/javascript'
    : 'application/json',
    -charset                      => 'UTF-8',
    -cache_control                => 'no-cache',
    -access_control_allow_origin  => '*',
    -access_control_allow_headers => '*',
    -access_control_allow_methods => 'GET, HEAD, POST, OPTIONS',
    -content_length               => bytes::length($body),
);
print $body;
