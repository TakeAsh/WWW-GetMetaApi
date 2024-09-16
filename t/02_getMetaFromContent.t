#!/usr/bin/perl

use strict;
use warnings;
use utf8;
use Test::More;
use Test::More::UTF8;
use YAML::Syck qw(Load LoadFile Dump DumpFile);
use FindBin::libs "Bin=${FindBin::RealBin}";
use WWW::GetMetaApi;

$YAML::Syck::ImplicitUnicode = 1;

subtest 'getMetaFromContent' => sub {
    my $testcases = Load(
        <<"EOS"
-   label: 'no meta'
    input: |
        <html>
            <head>
            </head>
        </html>
    expected:
        title: ''
        _title: ''
        _description: ''
        _image: ''
-   label: 'Title out of head'
    input: |
        <html>
            <head>
            </head>
            <title>
                Title
            </title>
        </html>
    expected:
        title: Title
        _title: Title
        _description: ''
        _image: ''
-   label: 'basic'
    input: |
        <html>
            <head>
                <title>Title</title>
                <meta name="title" content="Title1">
                <meta name="description" content="Desc1"/>
                <meta name="og:image" content="Img1" />
            </head>
        </html>
    expected:
        title: Title1
        description: Desc1
        "og:image": Img1
        _title: Title1
        _description: Desc1
        _image: Img1
-   label: 'property'
    input: |
        <html>
            <head>
                <title>Title</title>
                <meta property="title" content="Title1">
                <meta property="description" content="Desc1"/>
                <meta property="og:image" content="Img1" />
            </head>
        </html>
    expected:
        title: Title1
        description: Desc1
        "og:image": Img1
        _title: Title1
        _description: Desc1
        _image: Img1
-   label: 'priority'
    input: |
        <html>
            <head>
                <title>Title</title>
                <meta name="title" content="Title1" />
                <meta name="description" content="Desc1" />
                <meta name="og:title" content="Title2_og" />
                <meta name="og:description" content="Desc2_og" />
                <meta name="og:image" content="Img2_og" />
                <meta name="twitter:title" content="Title3_twitter" />
                <meta name="twitter:description" content="Desc3_twitter" />
                <meta name="twitter:image" content="Img3_twitter" />
            </head>
        </html>
    expected:
        title: Title1
        description: Desc1
        "og:title": Title2_og
        "og:description": Desc2_og
        "og:image": Img2_og
        "twitter:title": Title3_twitter
        "twitter:description": Desc3_twitter
        "twitter:image": Img3_twitter
        _title: Title3_twitter
        _description: Desc3_twitter
        _image: Img3_twitter
-   label: 'reverse'
    input: |
        <html>
            <head>
                <title>Title</title>
                <meta content="Title1" name="title">
                <meta content="Desc1" name="description"/>
                <meta content="Img1" name="og:image" />
            </head>
        </html>
    expected:
        title: Title1
        description: Desc1
        "og:image": Img1
        _title: Title1
        _description: Desc1
        _image: Img1
-   label: 'extra property'
    input: |
        <html>
            <head>
                <title>Title</title>
                <meta name="title" content="Title1" data-some="true">
                <meta name="description" content="Desc1" data-some="true"/>
                <meta name="og:image" content="Img1" data-some="true" />
            </head>
        </html>
    expected:
        title: Title1
        description: Desc1
        "og:image": Img1
        _title: Title1
        _description: Desc1
        _image: Img1
-   label: 'extra property before'
    input: |
        <html>
            <head>
                <title data-some="true">Title</title>
                <meta data-some="true" name="title" content="Title1">
                <meta data-some="true" name="description" content="Desc1"/>
                <meta data-some="true" name="og:image" content="Img1"  />
            </head>
        </html>
    expected:
        title: Title1
        description: Desc1
        "og:image": Img1
        _title: Title1
        _description: Desc1
        _image: Img1
-   label: 'reverse, extra property'
    input: |
        <html>
            <head>
                <title>Title</title>
                <meta content="Title1" name="title" data-some="true">
                <meta content="Desc1" name="description" data-some="true"/>
                <meta content="Img1" name="og:image" data-some="true" />
            </head>
        </html>
    expected:
        title: Title1
        description: Desc1
        "og:image": Img1
        _title: Title1
        _description: Desc1
        _image: Img1
EOS
    );
    foreach my $testcase ( @{$testcases} ) {
        is_deeply(
            getMetaFromContent( $testcase->{'input'} ),
            $testcase->{'expected'},
            $testcase->{'label'}
        );
    }
};

done_testing();
