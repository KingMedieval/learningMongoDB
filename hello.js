const { MongoClient } = require('mongodb');
const { MONGO_URI } = require("./config.json");
const bcrypt = require('bcrypt');

//client is initiated
const client = new MongoClient(MONGO_URI);

async function main() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    //client.db sets the database the client is on
    //dbname.collection sets the collection within the database for the client
    const dbName = client.db('credTest');
    const userCreds = dbName.collection('UserCreds');
    //findOne finds one document that fits the criteria. if there are multiple docs,
    //it will use the first doc in its natural order
    query = await userCreds.findOne({userID: "john"});
    //it should print the first document that meets criteria
    console.log(query);

    //to find multiple documents, you need to have a pipeline
    //$match will find documents that match the criteria
    const pipeline = [
        { $match: {
            $and: [                 //logical op: $and, $not, $nor, $or has to be in array
                { tags: "tag1" },
                { progLang: "c" }
            ]}},
    //$group will group the results from the match above
    //in this case, it will print userID and their tags associated to userID
        { $group: {
            _id: "$userID",
            tags: { $push: "$tags" }
            }}];

    //this aggregates the results by going thru the pipeline
    //if you need help aggregating, use the gui software for mondo to simulate a pipeline
    const aggCursor = userCreds.aggregate(pipeline);
    for await (const aggGroup of aggCursor) { //for loop for the number of items in the cursor
        console.log(aggGroup); //aggGroup is the grouped result after the pipeline
    }

    //insertMany can insert multiple documents at once.
    await userCreds.insertMany([
        {
            "userID" : "daphne",
            "password": "dappassword",
            "bio": "daphne coder",
            "tags": [ "daphne", "tag1", "tag2" ],
            "progLang": [ "cpp", "c", "java", "python" ],
            "joinTime": new Date( "2022-10-06T02:25:01.000Z" ),
            "userStats": {
                "numProj": 12,
                "numMatches": 22
            },
            "userSocials": {
                "github": "https://github.com",
                "instagram": "https://instagram.com",
                "twitter": "https://twitter.com"
            },
            "hashedPass": "$2a$10$RajGWvqtozYEvTOhgWJnneq8mDgW1aVkuCEWXeZrAWSNLOQCj4AyG"
        },
        {
            "userID" : "talbot",
            "password": "talbotpassword",
            "bio": "johnathan talbot",
            "tags": [ "talbot", "tag1", "tag2", "tag4" ],
            "progLang": [ "cpp", "c", "react", "java", "python" ],
            "joinTime": new Date( "2022-10-09T21:13:12.000Z" ),
            "userStats": {
                "numProj": 112,
                "numMatches": 102
            },
            "userSocials": {
                "github": "https://github.com",
                "instagram": "https://instagram.com",
                "twitter": "https://twitter.com"
            },
            "hashedPass": "$2a$10$U54e2yQ32Ot2IDBTSdw/7OGZLdmFkJ1IW6DfR.z3.b7rV97Ff/TDe"
        }
    ]);

    //this part, I am learning how to hash passwords to store in a safer manner
    const testPassword = "Pass_Word1234";
    const saltRounds = 10; //higher number of rounds, stronger the hash

    //generates salt with the cost being saltRounds, outputs to variable name salt
    bcrypt.genSalt(saltRounds, function(saltError, salt) {
        //generates the hash from the salt generated above
        bcrypt.hash(testPassword, salt, function(hashError, hash){
            console.log(hash);

            //here it compares the input password with the hashed password
            bcrypt.compare(testPassword, hash, function(err, result) {
                console.log(`${result}: does match`);
            });
            bcrypt.compare("pass_word1234", hash, function(err, result) {
                console.log(`${result}: lower caps are not matching`);
            });
        });
    });


    return 0;
}

main()
    .catch(console.error)
    .finally(() => client.close());