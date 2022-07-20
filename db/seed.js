const { client,
        getAllUsers,
        createUser,
        updateUser,
        getAllPosts,
        createPost,
        updatePost,
        getUserById,
} = require('./index');

async function dropTables() {
    try {
        console.log('Starting to drop tables...')
        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `);
        console.log('Finished dropping tables!')
    } catch (error) {
        console.error('Error dropping tables!')
        throw error;
    }
}

async function createTables() {
    try {
        console.log('Starting to build tables...')
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL,
                name varchar(255) NOT NULL,
                location varchar(255) NOT NULL,
                active BOOLEAN DEFAULT true
            );
        `);

        await client.query(`
            CREATE TABLE posts(
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
            );
        `);

        await client.query(`
            CREATE TABLE tags(
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );
        `);

        await client.query(`
            CREATE TABLE post_tags(
                "postId" INTEGER REFERENCES posts(id) UNIQUE,
                "tagId" INTEGER REFERENCES tags(id)
            );
        `);

        console.log('Finished building tables!')
    } catch (error) {
        console.error('Error building tables!')
        throw error;
    }
}

async function createInitialUsers() {
    try {
        console.log("Starting to create users...");
        await createUser({ username: 'albert', password: 'bertie99', name: 'albert', location: 'cali' });
        await createUser({ username: 'sandra',  password: '2sandy4me', name: 'sandra', location: 'florida' });
        await createUser({ username: 'glamgal', password: 'soglam', name: 'annie', location: 'kcmo' });
        console.log("Finished creating users!");
    } catch (error) {
        console.error("Error creating users!");
        throw error;
    }
}

async function createInitialPosts() {
    try {
        console.log("Creating initial posts...");
        const [albert, sandra, glamgal] = await getAllUsers();

        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
            tags: ["#happy", "#youcandoanything"]
        });

        await createPost({
            authorId: sandra.id,
            title: "Test Post",
            content: "I am Sandra and this is me testing my post.",
            tags: ["#happy", "#worsy-day-ever"]
        });

        await createPost({
            authorId: glamgal.id,
            title: "Glammyglam",
            content: "I am the most glam",
            tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
        });

        console.log("created initial posts");

    } catch (error) {
        throw error;
    }
}

// async function createInitialTags() {
//     try {
//         console.log("creating initial tags...");
//         const [happy, sad, inspo, catman] = await createTags(['#happy', '#worst-day-ever', '#youcandoanything', '#catmandoeverything']);

//         const [postOne, postTwo, postThree] = await getAllPosts();

//         await addTagsToPost(postOne.id, [happy, inspo]);
//         await addTagsToPost(postTwo.id, [sad, inspo]);
//         await addTagsToPost(postThree.id, [happy, catman, inspo]);

//         console.log("created initial tags");

//     } catch (error) {
//         throw error;
//     }
// }

async function rebuildDB() {
    try {
        client.connect();
        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
    } catch (error) {
        throw error;
    }
}

async function testDB() {
    try {
        console.log('Starting to test database...');

        console.log('Getting all users...');
        const users = await getAllUsers();
        console.log("getAllUsers: ", users);
        console.log('Got users!');

        console.log('Updating users...');
        const updateUserResult = await updateUser(users[0].id, {
            name: 'Newname',
            location: 'London'
        });
        console.log("Update User Result: ", updateUserResult);

        console.log("Getting all posts...");
        const posts = await getAllPosts();
        console.log("All Posts Result: ", posts);
        console.log("Got all posts");

        console.log("Updating posts...");
        const updatePostResult = await updatePost(posts[0].id, {
            title: "New Title",
            content: "Updated Content!!!"
        })
        console.log("Update Post Result: ", updatePostResult);
        console.log("done updating posts");

        console.log("updating post[1] tags only");
        const updatePostTagResult = await updatePost(posts[1].id, {
            tags: ["#youcandoanything", "#redfish", "#bluefish"]
        });
        console.log("Result: ", updatePostTagResult);

        console.log("Getting users by ID");
        const albert = await getUserById(1);
        const sandra = await getUserById(2);
        const glamgal = await getUserById(3);
        console.log("Albert Result: ", albert);
        console.log("Sandra Result: ", sandra);
        console.log("Glamgal Result: ", glamgal);
        
        console.log('Finished database tests!');
    } catch (error) {
        console.error("Error testing database!");
        throw error;
    }
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());