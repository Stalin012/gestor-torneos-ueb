<?php

namespace App\Traits;

trait ApiResponse
{
    protected function successResponse($data = null, $message = 'Success', $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    protected function errorResponse($message = 'Error', $code = 400, $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    protected function notFoundResponse($message = 'Resource not found')
    {
        return $this->errorResponse($message, 404);
    }

    protected function unauthorizedResponse($message = 'Unauthorized')
    {
        return $this->errorResponse($message, 401);
    }

    protected function validationErrorResponse($errors)
    {
        return $this->errorResponse('Validation failed', 422, $errors);
    }
}
