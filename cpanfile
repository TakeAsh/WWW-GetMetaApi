requires 'Encode';
requires 'File::Share';
requires 'File::Slurp';
requires 'FindBin::libs';
requires 'HTTP::CookieJar::LWP';
requires 'JSON::XS';
requires 'LWP::UserAgent';
requires 'YAML::Syck';
requires 'feature';
requires 'perl', '5.010';
requires 'version', '0.77';

on configure => sub {
    requires 'Module::Build::Tiny', '0.035';
};

on test => sub {
    requires 'Test::More', '0.98';
};
