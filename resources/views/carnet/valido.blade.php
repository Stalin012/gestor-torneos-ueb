<!DOCTYPE html>
<html>
<head>
    <title>Carnet válido</title>
</head>
<body style="font-family: Arial">
    <h2 style="color: green">Carnet válido</h2>

    <p><b>Nombre:</b> {{ $persona->nombres }} {{ $persona->apellidos }}</p>
    <p><b>Cédula:</b> {{ $jugador->cedula }}</p>
    <p><b>Equipo:</b> {{ $equipo->nombre ?? 'Sin equipo' }}</p>
    <p><b>Fecha de emisión:</b> {{ $fecha }}</p>

    <hr>
    <small>Documento verificado correctamente</small>
</body>
</html>
