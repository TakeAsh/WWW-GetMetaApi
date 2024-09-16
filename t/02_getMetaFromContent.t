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
    my @testcases = (
        {   label => 'no meta',
            input => <<"EOS"
<html>
    <head>
    </head>
</html>
EOS
            ,
            expected => <<"EOS"
title: ''
_title: ''
_description: ''
_image: ''
EOS
        },
        {   label => 'Title out of head',
            input => <<"EOS"
<html>
    <head>
    </head>
    <title>
        Title
    </title>
</html>
EOS
            ,
            expected => <<"EOS"
title: Title
_title: Title
_description: ''
_image: ''
EOS
        },
        {   label => 'basic',
            input => <<"EOS"
<html>
    <head>
        <title>Title</title>
        <meta name="title" content="Title1">
        <meta name="description" content="Desc1"/>
        <meta name="og:image" content="Img1" />
    </head>
</html>
EOS
            ,
            expected => <<"EOS"
title: Title1
description: Desc1
"og:image": Img1
_title: Title1
_description: Desc1
_image: Img1
EOS
        },
        {   label => 'property',
            input => <<"EOS"
<html>
    <head>
        <title>Title</title>
        <meta property="title" content="Title1">
        <meta property="description" content="Desc1"/>
        <meta property="og:image" content="Img1" />
    </head>
</html>
EOS
            ,
            expected => <<"EOS"
title: Title1
description: Desc1
"og:image": Img1
_title: Title1
_description: Desc1
_image: Img1
EOS
        },
        {   label => 'priority',
            input => <<"EOS"
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
EOS
            ,
            expected => <<"EOS"
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
EOS
        },
        {   label => 'reverse',
            input => <<"EOS"
<html>
    <head>
        <title>Title</title>
        <meta content="Title1" name="title">
        <meta content="Desc1" name="description"/>
        <meta content="Img1" name="og:image" />
    </head>
</html>
EOS
            ,
            expected => <<"EOS"
title: Title1
description: Desc1
"og:image": Img1
_title: Title1
_description: Desc1
_image: Img1
EOS
        },
        {   label => 'extra property',
            input => <<"EOS"
<html>
    <head>
        <title>Title</title>
        <meta name="title" content="Title1" data-some="true">
        <meta name="description" content="Desc1" data-some="true"/>
        <meta name="og:image" content="Img1" data-some="true" />
    </head>
</html>
EOS
            ,
            expected => <<"EOS"
title: Title1
description: Desc1
"og:image": Img1
_title: Title1
_description: Desc1
_image: Img1
EOS
        },
        {   label => 'reverse, extra property',
            input => <<"EOS"
<html>
    <head>
        <title>Title</title>
        <meta content="Title1" name="title" data-some="true">
        <meta content="Desc1" name="description" data-some="true"/>
        <meta content="Img1" name="og:image" data-some="true" />
    </head>
</html>
EOS
            ,
            expected => <<"EOS"
title: Title1
description: Desc1
"og:image": Img1
_title: Title1
_description: Desc1
_image: Img1
EOS
        },
    );
    foreach my $testcase (@testcases) {
        is_deeply(
            getMetaFromContent( $testcase->{'input'} ),
            Load( $testcase->{'expected'} ),
            $testcase->{'label'}
        );
    }
};

done_testing();
