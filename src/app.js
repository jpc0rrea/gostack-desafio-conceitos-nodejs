const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: "Invalid repository ID." });
  }

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id === id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "Repository not found." });
  }

  request.repositoryIndex = repositoryIndex;

  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const newRepository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(newRepository);

  return response.json(newRepository);
});

app.put("/repositories/:id", validateRepositoryId, (request, response) => {
  const { id } = request.params;

  const { title, url, techs } = request.body;

  const repositoryIndex = request.repositoryIndex;

  const likesQuantity = repositories[repositoryIndex].likes;

  const editedRepository = {
    id,
    title,
    url,
    techs,
    likes: likesQuantity,
  };

  repositories[repositoryIndex] = editedRepository;

  return response.json(editedRepository);
});

app.delete("/repositories/:id", validateRepositoryId, (request, response) => {
  repositories.splice(request.repositoryIndex, 1);

  return response.status(204).send();
});

app.post(
  "/repositories/:id/like",
  validateRepositoryId,
  (request, response) => {
    const repository = repositories[request.repositoryIndex];

    repository.likes += 1;

    return response.json(repository);
  }
);

module.exports = app;
