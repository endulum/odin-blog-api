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

main().catch(e => console.log(e));

async function main() {
  console.log(`Connecting with URL "${mongoDB}"`);
  const conn = await mongoose.connect(mongoDB);
  console.log(`Connected to database "${conn.connection.name}"`);
  await emptyAuthors();
  await emptyPosts();
  await emptyComments();
  await emptyInvites();
  await generateContent();
  console.log(`Nothing left to do, closing connection.`);
  mongoose.connection.close();
}

async function emptyAuthors() {
  const authors = await Author.find({}).exec();
  if (authors.length > 0) {
    console.log(`Found ${authors.length} authors. Deleting...`);
    await Author.deleteMany({});
  }
}

async function emptyPosts() {
  const posts = await Post.find({}).exec();
  if (posts.length > 0) {
    console.log(`Found ${posts.length} posts. Deleting...`);
    await Post.deleteMany({});
  }
}

async function emptyComments() {
  const comments = await Comment.find({}).exec();
  if (comments.length > 0) {
    console.log(`Found ${comments.length} comments. Deleting...`);
    await Comment.deleteMany({});
  }
}

async function emptyInvites() {
  const invites = await Invite.find({}).exec();
  if (invites.length > 0) {
    console.log(`Found ${invites.length} invites. Deleting...`);
    await Invite.deleteMany({});
  }
}

async function generateContent() {
  const pass = await bcryptjs.hash('coolPassword', 10);
  const randomAuthor = await Author.create({
    username: 'adminAuthor',
    password: pass,
    penName: faker.person.fullName().split(' ').join('_')
  });

  await Invite.create({
    code: faker.finance.accountNumber({ length: 16 })
  });

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

  for (let i = 0; i < 4; i++) {
    const post = await Post.create({
      author: randomAuthor,
      title: lorem.generateWords(random(6, 2)),
      subtitle: lorem.generateSentences(1),
      text: lorem.generateParagraphs(random(10, 5)),
      isVisible: i%2==0 ? false : true
    });

    for (let j = 0; j < i; j++) {
      const comment = await Comment.create({
        post: post,
        commenterName: faker.person.fullName(),
        text: lorem.generateSentences(random(3, 1)),
      });

      post.comments.push(comment);
      await post.save();
    }

    randomAuthor.posts.push(post);
    await randomAuthor.save();
  }
}

function random(max, min = 1) {
  let number = 0;
  while (number < min) {
    number = Math.ceil(Math.random() * max);
  }
  return number;
}