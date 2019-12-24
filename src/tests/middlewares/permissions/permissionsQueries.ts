export const userQuery = `
query user($where: UserWhereUniqueInput!){
    user(where: $where){
        createdAt
        email
        id
        role
        todos {
            content
            createdAt
            done
            id
            updatedAt
        }
        updatedAt
        username
    }
}
`;

export const usersQuery = `
query users($where: UserWhereInput) {
    users(first: 10, where: $where) {
      createdAt
      email
      id
      role
      todos {
        content
        createdAt
        done
        id
        updatedAt
      }
      updatedAt
      username
    }
  }
`;

export const createTodoMutation = `
mutation createTodo($input: CreateTodoInput!){
    createTodo(input: $input){
        content
        createdAt
        done
        id
        updatedAt
        user{
            createdAt
            email
            id
            role
            updatedAt
            username
        }
    }
}
`;
export const updateTodoMutation = `
mutation updateTodo($input: UpdateTodoInput!){
    updateTodo(input: $input){
        content
        createdAt
        done
        id
        updatedAt
        user{
            createdAt
            email
            id
            role
            updatedAt
            username
        }
    }
}
`;

export const deleteTodoMutation = `
mutation deleteTodo($input: DeleteTodoInput!){
    deleteTodo(input: $input){
        content
        createdAt
        done
        id
        updatedAt
        user{
            createdAt
            email
            id
            role
            updatedAt
            username
        }
    }
}
`;

export const todosWithUsernameQuery = `
query todos {
    todos(first: 10) {
      id
      user {
        username
      }
    }
  }
`;

export const todosWithUserDataQuery = `
query todos {
    todos(first: 10) {
      id
      user {
        id
        username
      }
    }
  }
`;
