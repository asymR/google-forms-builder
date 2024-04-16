<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Form Builder</title>
        <link rel="stylesheet" href="styles/style.css?v=1.0.9">
    </head>
    <body>
        <div id="form-builder"></div>
        <div id="result-builder"></div>
        <script src="scripts/script.js?v=1.0.9"></script>
        <script>
            formBuilderLib.load("form-builder", "./", function (data) {
                document.getElementById("result-builder").innerHTML = "";
                document.getElementById("result-builder").appendChild(data);
            });
        </script>
    </body>
</html>