
DROP TABLE [mnemonic];
DROP TABLE [balances];
DROP TABLE [server];

CREATE TABLE mnemonic (id TEXT, mnemonic TEXT, usd REAL);
CREATE TABLE balances (id TEXT, currency TEXT, name TEXT, amount REAL, usd REAL);
CREATE TABLE server (url TEXT);