const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  count: Number,
  log: [
    {
      description: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
      date: Date,
    },
  ],
});

userSchema.methods.addExercise = function(exercise) {
    const logs = [...this.log];
    logs.push(exercise);
    this.log = logs;
    return this.save();
}

module.exports = mongoose.model("User", userSchema);
