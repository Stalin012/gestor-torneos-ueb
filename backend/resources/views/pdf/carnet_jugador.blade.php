<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        /* CONFIGURACIÓN CRÍTICA (85.6mm x 54mm) */
        @page { 
            size: 85.6mm 54mm landscape;
            margin: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            width: 85.6mm;
            height: 54mm;
            overflow: hidden;
            font-family: 'Helvetica', 'Arial', sans-serif;
            background-color: #020617;
            color: #ffffff;
        }

        .carnet {
            width: 85.6mm;
            height: 54mm;
            position: relative;
            background-color: #020617;
            overflow: hidden;
        }

        /* DISEÑO DE FONDO */
        .header-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 11mm;
            background-color: #0f172a;
            border-bottom: 0.6mm solid #3b82f6;
            z-index: 10;
        }

        .decorative-line {
            position: absolute;
            left: 0;
            top: 0;
            width: 1.2mm;
            height: 100%;
            background: linear-gradient(to bottom, #3b82f6, #fbbf24);
            z-index: 20;
        }

        /* HEADER TEXT */
        .header-text {
            position: absolute;
            top: 2mm;
            left: 5mm;
            z-index: 15;
        }

        .title-main {
            font-size: 4.5mm;
            font-weight: 900;
            letter-spacing: 0.4mm;
            text-transform: uppercase;
            line-height: 1;
        }

        .title-sub {
            font-size: 1.8mm;
            color: #94a3b8;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 0.5mm;
        }

        .year-tag {
            position: absolute;
            top: 3.5mm;
            right: 4mm;
            z-index: 15;
            background-color: #3b82f6;
            color: white;
            padding: 0.5mm 1.5mm;
            border-radius: 0.8mm;
            font-size: 1.7mm;
            font-weight: 900;
        }

        /* ÁREA DE FOTO (Izquierda) */
        .photo-area {
            position: absolute;
            top: 14mm;
            left: 5mm;
            width: 28mm;
            z-index: 5;
        }

        .photo-frame {
            width: 28mm;
            height: 35mm;
            border: 0.5mm solid rgba(59, 130, 246, 0.4);
            border-radius: 2mm;
            background-color: #0f172a;
            overflow: hidden;
            box-shadow: 0 1mm 3mm rgba(0,0,0,0.5);
        }

        .photo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .no-photo {
            width: 100%;
            height: 100%;
            display: table;
            text-align: center;
        }

        .no-photo-text {
            display: table-cell;
            vertical-align: middle;
            font-size: 14mm;
            font-weight: 900;
            color: rgba(59, 130, 246, 0.15);
        }

        /* ÁREA DE INFORMACIÓN (Central - Protegida del QR) */
        .info-area {
            position: absolute;
            top: 14mm;
            left: 35mm;
            width: 28mm; /* EQUILIBRIO ENTRE ESPACIO Y QR */
            z-index: 5;
        }

        .label-top {
            font-size: 1.3mm;
            color: #3b82f6;
            font-weight: 900;
            text-transform: uppercase;
            margin-bottom: 0.1mm;
        }

        .name-big {
            font-weight: 900;
            line-height: 1.05;
            margin-bottom: 1mm;
            color: #ffffff;
            text-transform: uppercase;
            max-height: 11mm; /* SUFICIENTE PARA 3 LÍNEAS PEQUEÑAS */
            overflow: hidden;
        }

        .info-item {
            margin-bottom: 1mm;
            overflow: hidden;
        }

        .info-label {
            font-size: 1.1mm;
            color: #94a3b8;
            font-weight: 800;
            text-transform: uppercase;
            margin-bottom: 0mm;
        }

        .info-val {
            font-size: 2.1mm;
            font-weight: 700;
            color: #f1f5f9;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis; 
            display: block;
            width: 100%;
        }

        .info-val.yellow {
            color: #fbbf24;
            font-weight: 800;
        }

        /* SECCIÓN DORSAL */
        .dorsal-section {
            position: absolute;
            top: 14mm;
            right: 4mm;
            text-align: right;
            z-index: 5;
        }

        .dorsal-label {
            font-size: 1.2mm;
            color: #64748b;
            font-weight: 800;
            text-transform: uppercase;
        }

        .dorsal-num {
            font-size: 5mm;
            font-weight: 900;
            color: #3b82f6;
            line-height: 1;
        }

        /* SECCIÓN QR (Esquina Inferior Derecha) */
        .qr-section {
            position: absolute;
            bottom: 2mm;
            right: 2mm;
            width: 19mm;
            z-index: 30;
            text-align: center;
        }

        .qr-white-box {
            background-color: #ffffff;
            padding: 0.8mm;
            border-radius: 1.2mm;
            box-shadow: 0 0.8mm 3mm rgba(0,0,0,0.8);
            border: 0.4mm solid #3b82f6;
            display: inline-block;
        }

        .qr-white-box img {
            width: 15mm;
            height: 15mm;
            display: block;
        }

        .verified-pills {
            margin-top: 0.8mm;
            background-color: rgba(34, 197, 94, 0.15);
            border: 0.25mm solid rgba(34, 197, 94, 0.5);
            padding: 0.4mm 1.5mm;
            border-radius: 4mm;
            font-size: 1.3mm;
            color: #22c55e;
            font-weight: 900;
            text-transform: uppercase;
            white-space: nowrap;
            display: inline-block;
        }

        /* PIE DE PÁGINA */
        .footer-line {
            position: absolute;
            bottom: 1.2mm;
            left: 5mm;
            font-size: 1.1mm;
            color: rgba(148, 163, 184, 0.3);
            font-weight: bold;
            z-index: 5;
        }

    </style>
</head>
<body>
    <div class="carnet">
        <div class="decorative-line"></div>
        <div class="header-bg"></div>
        
        <div class="header-text">
            <div class="title-main">GESTOR DEPORTIVO</div>
            <div class="title-sub">Universidad Estatal de Bolívar</div>
        </div>
        
        <div class="year-tag">TEMPORADA {{ date('Y') }}</div>

        <!-- FOTO -->
        <div class="photo-area">
            <div class="photo-frame">
                @php
                    $foto = null;
                    if ($jugador->persona && $jugador->persona->foto) {
                        if (filter_var($jugador->persona->foto, FILTER_VALIDATE_URL)) {
                            $foto = $jugador->persona->foto;
                        } else {
                            $path = public_path('storage/' . $jugador->persona->foto);
                            if (file_exists($path)) {
                                $foto = $path;
                            }
                        }
                    }
                @endphp

                @if($foto)
                    <img src="{{ $foto }}" alt="Foto">
                @else
                    <div class="no-photo">
                        <div class="no-photo-text">{{ strtoupper(substr($jugador->persona->nombres ?? 'J', 0, 1)) }}</div>
                    </div>
                @endif
            </div>
        </div>

        @php
            $nombreCompleto = ($jugador->persona->nombres ?? '') . ' ' . ($jugador->persona->apellidos ?? '');
            $len = strlen($nombreCompleto);
            $fontSize = '4.2mm';
            if($len > 25) $fontSize = '2.8mm';
            elseif($len > 20) $fontSize = '3.3mm';
            elseif($len > 15) $fontSize = '3.8mm';
        @endphp

        <!-- INFORMACIÓN (Protegida) -->
        <div class="info-area">
            <div class="label-top">Deportista Oficial</div>
            <div class="name-big" style="font-size: {{ $fontSize }};">
                {{ strtoupper($jugador->persona->nombres ?? '') }}<br>
                {{ strtoupper($jugador->persona->apellidos ?? '') }}
            </div>

            <div class="info-item">
                <div class="info-label">Cédula Identidad</div>
                <div class="info-val">{{ $jugador->cedula }}</div>
            </div>

            <div class="info-item">
                <div class="info-label">Club / Representación</div>
                <div class="info-val yellow">{{ strtoupper($jugador->equipo->nombre ?? 'ESTADO LIBRE') }}</div>
            </div>

            @if(isset($jugador->facultad) && $jugador->facultad)
            <div class="info-item">
                <div class="info-label">Facultad / Unidad</div>
                <div class="info-val">{{ strtoupper($jugador->facultad) }}</div>
            </div>
            @endif

            @if(isset($jugador->carrera) && $jugador->carrera)
            <div class="info-item">
                <div class="info-label">Carrera de Formación</div>
                <div class="info-val">{{ strtoupper($jugador->carrera) }}</div>
            </div>
            @endif
        </div>

        <!-- DORSAL -->
        <div class="dorsal-section">
            <div class="dorsal-label">Dorsal</div>
            <div class="dorsal-num">#{{ str_pad($jugador->numero ?? '0', 2, '0', STR_PAD_LEFT) }}</div>
        </div>

        <!-- QR SECTION -->
        <div class="qr-section">
            <div class="qr-white-box">
                @if(isset($qrCode))
                    <img src="data:image/svg+xml;base64,{{ $qrCode }}">
                @else
                    <div style="font-size: 3pt; color: red;">QR ERROR</div>
                @endif
            </div>
            <div class="verified-pills">● VERIFICADO</div>
        </div>

        <div class="footer-line">
            VALIDACIÓN: {{ strtoupper(substr(md5($jugador->cedula ?? 'X'), 0, 10)) }} | EMISIÓN: {{ date('d/m/Y') }}
        </div>
    </div>
</body>
</html>