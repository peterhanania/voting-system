const mongoose = require('mongoose');

const userVote = mongoose.Schema({
  
  id: {
    type: String,
    required: true,
    unique: true
  },

  lastVoted: { 
    type: Number 
  },

  votes: { 
  type: Number 
  }

});


module.exports = mongoose.model('votes', userVote);