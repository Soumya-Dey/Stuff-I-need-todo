# Stuff I Need To Do - todo list app
A simple todo list app made with node and express. MongoDB is used for saving the data. Served at heroku --> [stuffineedtodo.herokuapp.com](https://stuffineedtodo.herokuapp.com/)

## Usage
Create a **.env** file in the root directory and add the following replacing the mongoDB connection uri.
```
MONGO_URI=<YOUR MONGODB CONNECTION URI>
```
Then execute the following commands from the root directory.
```
npm install
npm run dev

Go to localhost:3000
```