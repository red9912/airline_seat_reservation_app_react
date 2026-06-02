BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "“aerei”" (
	"“id”"	INTEGER,
	"“nome”"	TEXT,
	"“numeroFile”"	INTEGER,
	"“postiPerFila”"	INTEGER,
	PRIMARY KEY("“id”" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "“prenotazioni”" (
	"“id”"	INTEGER,
	"“aereoId”"	INTEGER,
	"“utenteId”"	INTEGER,
	"“dataPrenotazione”"	DATE,
	PRIMARY KEY("“id”" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "“posti”" (
	"“id”"	INTEGER,
	"“aereoId”"	INTEGER,
	"“numeroFila”"	INTEGER,
	"“posizioneFila”"	TEXT,
	"“idPrenotazione”"	INTEGER,
	PRIMARY KEY("“id”" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "“utenti”" (
	"“id”"	INTEGER,
	"“nome”"	TEXT,
	"“email”"	TEXT,
	"“salt”"	TEXT,
	"“password”"	TEXT,
	PRIMARY KEY("“id”" AUTOINCREMENT)
);
COMMIT;
