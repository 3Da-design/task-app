<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic feature test example.
     */
    public function test_can_get_tasks()
    {
        $response = $this->get('/api/tasks');
        $response->assertStatus(200);
    }

    public function test_can_create_task()
    {
        $response = $this->post('/api/tasks', [
            'title' => 'test'
        ]);

        $response->assertStatus(201);
    }
}
