var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var async = require('async');

// Create connection to database
var config = {
  userName: process.env.MSSQL_NODEJS_CRUD_USERNAME, // update me
  password: process.env.MSSQL_NODEJS_CRUD_PASSWORD, // update me
  server: 'localhost',
  options: {
    database: 'SampleDB'
  }
}
var connection = new Connection(config);

// Attempt to connect and execute queries if connection goes through
connection.on('connect', function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected');

    // Execute all functions in the array serially
    async.waterfall([
      function Start(callback) {
        console.log('Starting...');
        callback(null, 'Jake', 'United States', '["SQL", "C#", ".NET Core"]');
      },
      function Insert(name, location, skills, callback) {
        console.log("Inserting '" + name + "' into Table...");

        request = new Request(
          'INSERT INTO TestSchema.Employees (Name, Location, Skills) OUTPUT INSERTED.Id VALUES (@Name, @Location, @Skills);',
          function(err, rowCount, rows) {
            if (err) {
              callback(err);
            } else {
              console.log(rowCount + ' row(s) inserted');
              callback(null, 'Nikita', 'United States');
            }
          });
        request.addParameter('Name', TYPES.NVarChar, name);
        request.addParameter('Location', TYPES.NVarChar, location);
        request.addParameter('Skills', TYPES.NVarChar, skills);

        // Execute SQL statement
        connection.execSql(request);
      },
      function Update(name, location, callback) {
        console.log("Updating Location to '" + location + "' for '" + name + "'...");

        // Update the employee record requested
        request = new Request(
          'UPDATE TestSchema.Employees SET Location=@Location WHERE Name = @Name;',
          function(err, rowCount, rows) {
            if (err) {
              callback(err);
            } else {
              console.log(rowCount + ' row(s) updated');
              callback(null, 'Jared');
            }
          });
        request.addParameter('Name', TYPES.NVarChar, name);
        request.addParameter('Location', TYPES.NVarChar, location);

        // Execute SQL statement
        connection.execSql(request);
      },
      function Delete(name, callback) {
        console.log("Deleting '" + name + "' from Table...");

        // Delete the employee record requested
        request = new Request(
          'DELETE FROM TestSchema.Employees WHERE Name = @Name;',
          function(err, rowCount, rows) {
            if (err) {
              callback(err);
            } else {
              console.log(rowCount + ' row(s) deleted');
              callback(null);
            }
          });
        request.addParameter('Name', TYPES.NVarChar, name);

        // Execute SQL statement
        connection.execSql(request);
      },
      function Read(callback) {
        console.log('Reading rows from the Table...');

        // Read all employees from table in JSON format
        var result = '';
        request = new Request(
          'SELECT Id, Name, Location, JSON_QUERY(Skills) AS Skills FROM TestSchema.Employees FOR JSON AUTO;',
          function(err, rowCount) {
            if (err) {
              callback(err);
            } else {
              employees = JSON.parse(result);
              console.log(employees);
              callback(null);
            }
          }
        );

        // Concatenate rows in case JSON string was split into chunks
        request.on('row', function(columns) {
          if (columns[0].value != null) {
            result += columns[0].value;
          }
        });
        
        // Execute SQL statement
        connection.execSql(request);
      }
    ],
    function Complete(err, result) {
      if (err) {
        callback(err);
      } else {
        console.log("Done!");
      }
    }
                   )
  }
});