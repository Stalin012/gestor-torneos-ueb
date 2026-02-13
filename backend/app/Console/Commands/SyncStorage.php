<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class SyncStorage extends Command
{
    protected $signature = 'storage:sync';
    protected $description = 'Sincroniza archivos de storage/app/public a public/storage (alternativa al enlace simbólico)';

    public function handle()
    {
        $source = storage_path('app/public');
        $destination = public_path('storage');

        if (!File::exists($source)) {
            $this->error('El directorio source no existe: ' . $source);
            return 1;
        }

        // Crear el directorio de destino si no existe
        if (!File::exists($destination)) {
            File::makeDirectory($destination, 0755, true);
        }

        // Copiar recursivamente
        $this->info('Sincronizando archivos...');
        
        try {
            File::copyDirectory($source, $destination);
            $this->info('✓ Archivos sincronizados correctamente');
            $this->info('  Origen: ' . $source);
            $this->info('  Destino: ' . $destination);
            return 0;
        } catch (\Exception $e) {
            $this->error('Error al sincronizar: ' . $e->getMessage());
            return 1;
        }
    }
}
