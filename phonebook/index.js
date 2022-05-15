require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
morgan.token('content', (req) => {
  return JSON.stringify(req.body);
});

app.use(express.static('build'));
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'));

const Person = require('./models/person');
// get info
app.get('/info', (req, res) => {
  Person.estimatedDocumentCount()
    .then(count => {
      const info = `<p>Phonebook has info for ${count} person(s)</p>
      <p>${new Date()}</p>`;
      res.send(info);
    });
});
// get all
app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  });
});
// get one
app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then(person => {
      if (person) res.json(person);
      else res.status(404).end();
    })
    .catch(e => next(e));
});
// delete one
app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndRemove(id)
    .then(() => res.status(204).end())
    .catch(e => next(e));
});
// post one
app.post('/api/persons', (req, res, next) => {
  const body = req.body;
  const person = new Person({
    name: body.name,
    number: body.number
  });
  person.save()
    .then(savedPerson => res.json(savedPerson))
    .catch(e => next(e));
});
// update one
app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body;
  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => res.json(updatedPerson))
    .catch(e => next(e));
});
// unknown paths
const unknownEndpoint = (req, res) => {
  console.log('testing unknown endpoint');
  res.status(404).json({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

// error handler
const errorHandler = (error, req, res, next) => {
  console.log(`Error name: ${error.name}`);
  if (error.code) console.log(`Error code: ${error.code}\n`);
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Malformatted ID' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  } else if (error.name === 'MongoServerError' && error.code === '11000') { // duplicate name error
    return res.status(409).json({ error: 'Duplicate Person' });
  }
  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
