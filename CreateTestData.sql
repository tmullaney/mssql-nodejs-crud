CREATE SCHEMA TestSchema;
GO

CREATE TABLE TestSchema.Employees (
  Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  Name NVARCHAR(50),
  Location NVARCHAR(50),
  Skills NVARCHAR(256) CONSTRAINT JsonOnly CHECK ( ISJSON(Skills) > 0 )
);
GO

INSERT INTO TestSchema.Employees (Name, Location, Skills) VALUES
(N'Jared', N'Australia', N'["SQL", "JavaScript", "Node.js"]'),
(N'Nikita', N'India', N'["SQL", "Python", "Django"]'),
(N'Tom', N'Germany', N'["SQL", "Ruby", "Rails"]');
GO

SELECT * FROM TestSchema.Employees;
GO