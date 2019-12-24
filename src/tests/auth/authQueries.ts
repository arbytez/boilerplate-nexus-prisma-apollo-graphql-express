export const signInMutation = `
mutation SignIn($input: SignInInput!){
    SignIn(input: $input){
        token
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

export const signUpMutation = `
mutation SignUp($input: SignUpInput!){
    SignUp(input: $input){
        token
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

export const signOutMutation = `
mutation SignOut{
    SignOut
}
`;

export const meQuery = `
query Me{
    Me{
        token
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
