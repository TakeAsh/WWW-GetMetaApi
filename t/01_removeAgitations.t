#!/usr/bin/perl

use strict;
use warnings;
use utf8;
use Test::More;
use Test::More::UTF8;
use FindBin::libs "Bin=${FindBin::RealBin}";
use WWW::GetMetaApi;

subtest 'removeAgitations' => sub {
    my @testcases = (
        {   input    => 'キャンペーン一覧 (PICK UP!順) | 電子書籍ストア-BOOK☆WALKER',
            expected => 'キャンペーン一覧 (PICK UP!順)',
        },
        {   input    => 'キャンペーン一覧 (PICK UP!順) | 電子書籍ストア-BOOK☆WALKER R-18館',
            expected => 'キャンペーン一覧 (PICK UP!順)',
        },
        {   input =>
                '検索結果です。KADOKAWAグループ内外の電子書籍を数多く配信中。新着のマンガ（漫画）・ライトノベル、文芸・小説、新書、実用書、写真集、雑誌など幅広く掲載。',
            expected => '検索結果です。',
        },
        {   input =>
                'フェアの一覧です。BOOK☆WALKERではKADOKAWAグループ内外の電子書籍を数多く配信中。新着のマンガ（漫画）・ライトノベル、文芸・小説、新書、実用書、写真集、雑誌など幅広く掲載。',
            expected => 'フェアの一覧です。',
        },
        {   input    => '（コミックス）(マンガ（漫画）)の電子書籍無料試し読みならBOOK☆WALKER',
            expected => '（コミックス）',
        },
        {   input    => '夏のフェア(マンガ（漫画）、画集)の電子書籍無料試し読みならBOOK☆WALKER',
            expected => '夏のフェア',
        },
        {   input    => 'シリーズ(ライトノベル)の電子書籍無料試し読みならBOOK☆WALKER',
            expected => 'シリーズ',
        },
        {   input    => '（ブックス）(新文芸)の電子書籍無料試し読みならBOOK☆WALKER',
            expected => '（ブックス）',
        },
        {   input    => '社(文芸・小説、実用)の電子書籍無料試し読みならBOOK☆WALKER',
            expected => '社',
        },
        {   input    => '（ノベルス）(文芸・小説)の電子書籍無料試し読みならBOOK☆WALKER',
            expected => '（ノベルス）',
        },
    );
    foreach my $testcase (@testcases) {
        is( removeAgitations( $testcase->{'input'} ),
            $testcase->{'expected'},
            $testcase->{'input'}
        );
    }
};

done_testing();
