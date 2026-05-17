import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || "us-east-1" });
const clientId = () => process.env.COGNITO_CLIENT_ID;

export async function signUpUser(email, password, name) {
  return client.send(new SignUpCommand({
    ClientId: clientId(),
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name",  Value: name  },
    ],
  }));
}

export async function confirmUser(email, code) {
  return client.send(new ConfirmSignUpCommand({
    ClientId: clientId(),
    Username: email,
    ConfirmationCode: code,
  }));
}

export async function authenticateUser(email, password) {
  return client.send(new InitiateAuthCommand({
    ClientId: clientId(),
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: { USERNAME: email, PASSWORD: password },
  }));
}

export async function resendCode(email) {
  return client.send(new ResendConfirmationCodeCommand({
    ClientId: clientId(),
    Username: email,
  }));
}

export async function forgotPassword(email) {
  return client.send(new ForgotPasswordCommand({
    ClientId: clientId(),
    Username: email,
  }));
}

export async function confirmForgotPassword(email, code, newPassword) {
  return client.send(new ConfirmForgotPasswordCommand({
    ClientId: clientId(),
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
  }));
}
