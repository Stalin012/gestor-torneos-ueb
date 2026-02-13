<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        /* Dimensiones estandar de tarjeta ID-1 (85.6mm x 53.98mm) */
        @page { 
            size: 242.6pt 153pt; 
            margin: 0; 
        }
        
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: 'Helvetica', 'Arial', sans-serif;
            width: 242.6pt;
            height: 153pt;
            overflow: hidden;
            background: #ffffff;
        }

        .card {
            width: 242.6pt;
            height: 153pt;
            position: relative;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: #ffffff;
            padding: 12pt;
            overflow: hidden;
        }

        /* Marca de agua - Modal Style */
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 40pt;
            color: rgba(255, 255, 255, 0.03);
            font-weight: bold;
            z-index: 0;
            pointer-events: none;
            white-space: nowrap;
        }

        /* Layout Grid */
        .layout-table {
            display: table;
            width: 100%;
            height: 100%;
            position: relative;
            z-index: 1;
        }

        .left-col {
            display: table-cell;
            vertical-align: top;
            width: auto;
            padding-right: 10pt;
        }

        .right-col {
            display: table-cell;
            vertical-align: top;
            width: 65pt;
            text-align: center;
        }

        /* Foto del Jugador */
        .photo-box {
            width: 48pt;
            height: 60pt;
            border: 1.5pt solid #3b82f6;
            border-radius: 4pt;
            background: #374151;
            overflow: hidden;
            margin-bottom: 8pt;
        }

        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .photo-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20pt;
            color: #3b82f6;
            font-weight: bold;
        }

        /* Datos del Jugador */
        .info-group {
            margin-bottom: 5pt;
        }

        .label {
            font-size: 6pt;
            color: #94a3b8;
            font-weight: bold;
            text-transform: uppercase;
            display: block;
            margin-bottom: 1pt;
        }

        .value {
            font-size: 8.5pt;
            color: #ffffff;
            font-weight: 700;
            line-height: 1.1;
        }

        .value-name {
            font-size: 9.5pt;
            text-transform: uppercase;
        }

        /* QR Code Container - Fix Visibility */
        .qr-wrapper {
            width: 50pt;
            height: 50pt;
            background: #ffffff;
            padding: 2.5pt;
            border-radius: 4pt;
            margin: 0 auto 8pt;
            display: block;
        }

        /* Asegurar que el SVG sea visible y llene el espacio en dompdf */
        .qr-wrapper svg {
            width: 45pt !important;
            height: 45pt !important;
            display: block !important;
        }

        /* Forzar color negro en las rutas del SVG si es necesario */
        .qr-wrapper svg path {
            fill: #000000 !important;
        }

        /* Detalles Inferiores Derecha */
        .footer-info {
            font-size: 7.5pt;
            color: #94a3b8;
            line-height: 1.3;
        }

        .badge-valid {
            color: #22c55e;
            font-weight: 900;
            font-size: 7.5pt;
            margin-top: 4pt;
            text-transform: uppercase;
        }

        /* Dorsal Estilo Modal */
        .dorsal-text {
            font-size: 7.5pt;
            font-weight: 700;
            color: #ffffff;
        }

    </style>
</head>
<body>
    <div class="card">
        <div class="watermark">OFICIAL</div>
        
        <div class="layout-table">
            <div class="left-col">
                <!-- Foto -->
                <div class="photo-box">
                    @if($jugador->persona && $jugador->persona->foto)
                        <img src="{{ public_path('storage/' . $jugador->persona->foto) }}">
                    @else
                        <div class="photo-placeholder">{{ substr($jugador->persona->nombres ?? 'J', 0, 1) }}</div>
                    @endif
                </div>

                <!-- Detalles -->
                <div class="info-group">
                    <span class="label">Nombre</span>
                    <span class="value value-name">{{ $jugador->persona->nombres }} {{ $jugador->persona->apellidos }}</span>
                </div>

                <div class="info-group">
                    <span class="label">Cédula</span>
                    <span class="value">{{ $jugador->persona->cedula }}</span>
                </div>

                <div style="display: table; width: 100%;">
                    <div style="display: table-cell; vertical-align: top;">
                        <div class="info-group">
                            <span class="label">Equipo</span>
                            <span class="value">{{ $jugador->equipo->nombre ?? 'LIBRE' }}</span>
                        </div>
                    </div>
                    <div style="display: table-cell; vertical-align: top; width: 35pt;">
                        <div class="info-group">
                            <span class="label">Dorsal</span>
                            <span class="value">#{{ $jugador->numero ?? 'S/N' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="right-col">
                <!-- QR Code (Garantizado) -->
                <div class="qr-wrapper">
                    {!! $qrCode !!}
                </div>

                <!-- Status & Info -->
                <div class="footer-info">
                    <div>{{ $jugador->persona->edad_calculada ?? '--' }} años</div>
                    <div>ID: {{ substr($jugador->persona->cedula, -4) }}</div>
                    <div class="badge-valid">VÁLIDO 2024</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>