export const allTodosIdQuery = `
query todos {
    todos(first: 10) {
      id
    }
  }
`;

export const todosIdEqContentQuery = `
query todos($content: String!) {
    todos(first: 10, where: { content: { equals: $content } }) {
      id
      content
    }
  }
`;

export const todosWithoutFirstLastQuery = `
query todos {
    todos {
      id
      content
    }
  }
`;

export const todosWithFirstCountInputQuery = `
query todos($count: Int!) {
    todos(first: $count) {
      id
      content
    }
  }
`;

export const todosWithLastCountInputQuery = `
query todos($count: Int!) {
    todos(last: $count) {
      id
      content
    }
  }
`;

export const todosWithFirstLastCountInputQuery = `
query todos($firstCount: Int!, $lastCount: Int!) {
    todos(first: $firstCount, last: $lastCount) {
      id
      content
    }
  }
`;

export const createTodoMutation = `
mutation createTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
    }
  }
`;

export const updateTodoMutation = `
mutation updateTodo($input: UpdateTodoInput!) {
    updateTodo(input: $input) {
      id
    }
  }
`;

export const deleteTodoMutation = `
mutation deleteTodo($input: DeleteTodoInput!){
  deleteTodo(input: $input){
      id
  }
}
`;
