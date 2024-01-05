import Author from '../models/author';
import Post from '../models/post';
import Comment from '../models/comment';
import Invite from '../models/invite';

import { faker } from '@faker-js/faker'
import { loremIpsum, LoremIpsum } from 'lorem-ipsum';
import bcryptjs from 'bcryptjs';

import mongoose from 'mongoose';
import 'dotenv/config';

console.log(`
  Helper script that connects to the blog project's database, wipes its data, and replenishes it with dummy data.
`);

const mongoDB = process.env.MONGO
const dummyPassPlain = process.env.DUMMYPASS;

main().catch(e => console.log(e));

async function main() {
  console.log(`Connecting with URL "${mongoDB}"`);
  const conn = await mongoose.connect(mongoDB);
  console.log(`Connected to database "${conn.connection.name}"`);

  await emptyAuthors();
  await emptyPosts();
  await emptyComments();

  await generateContent();

  console.log(`Nothing left to do, closing connection.`);
  mongoose.connection.close();
}

async function generateContent() {
  const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 8,
      min: 2
    },
    wordsPerSentence: {
      max: 16,
      min: 6
    }
  });

  console.log('Creating dummy content...');

  for (let i = 0; i < 5; i++) {
    const dummyPass = await bcryptjs.hash(dummyPassPlain, 10);
    const dummyFirstName = faker.person.firstName();
    const dummyLastName = faker.person.lastName();
    const dummyUserName = faker.internet.userName({ 
      firstName: dummyFirstName, 
      lastName: dummyLastName 
    });
    
    const randomAuthor = await Author.create({
      userName: dummyUserName,
      password: dummyPass,
      displayName: `${dummyFirstName} ${dummyLastName}`,
      bio: lorem.generateSentences(random(5, 2))
    });

    if (i !== 0) for (let j = 0; j < random(8); j++) {
      const randomPost = await Post.create({
        author: randomAuthor,
        title: lorem.generateWords(random(6, 2)),
        subtitle: lorem.generateSentences(1),
        content: lorem.generateParagraphs(random(8, 5)),
      });

      randomAuthor.posts.push(randomPost);
      await randomAuthor.save();

      if (j !== 0) for (let k = 0; k < random(8); k++) {
        const randomComment = await Comment.create({
          post: randomPost,
          commentBy: faker.person.fullName(),
          commentText: lorem.generateSentences(random(5, 2))
        });

        randomPost.comments.push(randomComment);
        await randomPost.save();
      }
    }
  }
}

async function emptyAuthors() {
  const authors = await Author.find({}).exec();
  if (authors.length > 0) {
    console.log(`Found ${authors.length} authors. Deleting...`);
    await Author.deleteMany({});
  } else console.log('No authors found to delete.');
}

async function emptyPosts() {
  const posts = await Post.find({}).exec();
  if (posts.length > 0) {
    console.log(`Found ${posts.length} posts. Deleting...`);
    await Post.deleteMany({});
  } else console.log('No posts found to delete.');
}

async function emptyComments() {
  const comments = await Comment.find({}).exec();
  if (comments.length > 0) {
    console.log(`Found ${comments.length} comments. Deleting...`);
    await Comment.deleteMany({});
  } else console.log('No comments found to delete.');
}

function random(max, min = 1) {
  let number = 0;
  while (number < min) {
    number = Math.ceil(Math.random() * max);
  }
  return number;
}