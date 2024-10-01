<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Group;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use App\Models\Message;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            "name" => "John Doe",
            "email" => "john@example.com",
            "password" => bcrypt("password"),
            "is_admin" => true
        ]);

        User::factory()->create([
            "name" => "Jane Doe",
            "email" => "jane@example.com",
            "password" => bcrypt("password"),
        ]);

        User::factory(10)->create();

        //create 5 groups all owned by the admin with id 1, and populate them randomly.
        for ($i = 0; $i < 5; $i++) {
            $group = Group::factory()->create([
                'owner_id' => 1,
            ]);

            $users = User::inRandomOrder()->limit(rand(2, 5))->pluck('users.id');
            $group->users()->attach(array_unique([1, ...$users]));
        }

        //create 1000 messages and select those that arent group msgs, i.e 1 on 1 convos
        Message::factory(1000)->create();
        $messages = Message::whereNull('messages.group_id')->orderBy('created_at')->get();

        //create the convos by taking all non-group messages,
        //group them such that each key corosponds to a unique convo for example 1_2 is between user1 and user2
        //now we have a collection of unique convos where the key is for example: 1_2 or 2_3 but never i_j such that i>j
        //then we iterate through the convos using map
        //for each convo we set the required fields
        //now we have a collection of convos ready to be instantiated,

        $conversations = $messages->groupBy(function ($message) {
            return collect([$message->sender_id, $message->receiver_id])->sort()->implode('_');
        })->map(function ($groupedMessages) {
            return [
                'user_id1' => $groupedMessages->first()->sender_id,
                'user_id2' => $groupedMessages->first()->receiver_id,
                'last_message_id' => $groupedMessages->last()->id,
                'created_at' => new Carbon(),
                'updated_at' => new Carbon(),
            ];
        })->values(); //keys are uneccessary, the keys were only used to group the messages by conversations

        //we insert convos (without the keys) to the conversation class which in turn will update the database accordingly
        Conversation::insertOrIgnore($conversations->toArray());
    }
}
