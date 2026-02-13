<?php

namespace App\Traits;

trait TransformsRelations
{
    protected function transformToCamelCase($data)
    {
        if ($data instanceof \Illuminate\Database\Eloquent\Collection) {
            return $data->map(fn($item) => $this->transformItem($item));
        }
        
        return $this->transformItem($data);
    }
    
    private function transformItem($item)
    {
        if (!$item) return $item;
        
        $array = $item->toArray();
        
        if (isset($array['equipo_local'])) {
            $array['equipoLocal'] = $array['equipo_local'];
            unset($array['equipo_local']);
        }
        
        if (isset($array['equipo_visitante'])) {
            $array['equipoVisitante'] = $array['equipo_visitante'];
            unset($array['equipo_visitante']);
        }
        
        return $array;
    }
}
