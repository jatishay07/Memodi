import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient, GetCommand, PutCommand,
  UpdateCommand, QueryCommand, ScanCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
export const ddb = DynamoDBDocumentClient.from(client);

const PATIENTS_TABLE = () => process.env.DYNAMODB_PATIENTS_TABLE;
const INTERACTIONS_TABLE = () => process.env.DYNAMODB_INTERACTIONS_TABLE;
const ALERTS_TABLE = () => process.env.DYNAMODB_ALERTS_TABLE;
const CAREGIVERS_TABLE = () => process.env.DYNAMODB_CAREGIVERS_TABLE;

export async function getPatient(patientId) {
  const result = await ddb.send(new GetCommand({
    TableName: PATIENTS_TABLE(),
    Key: { patientId }
  }));
  return result.Item ?? null;
}

export async function getPatientByEmail(email) {
  const result = await ddb.send(new QueryCommand({
    TableName: PATIENTS_TABLE(),
    IndexName: "EmailIndex",
    KeyConditionExpression: "email = :e",
    ExpressionAttributeValues: { ":e": email }
  }));
  return result.Items?.[0] ?? null;
}

export async function getPatientByConnectionCode(connectionCode) {
  const result = await ddb.send(new QueryCommand({
    TableName: PATIENTS_TABLE(),
    IndexName: "ConnectionCodeIndex",
    KeyConditionExpression: "connectionCode = :c",
    ExpressionAttributeValues: { ":c": connectionCode }
  }));
  return result.Items?.[0] ?? null;
}

export async function putPatient(item) {
  await ddb.send(new PutCommand({ TableName: PATIENTS_TABLE(), Item: item }));
}

export async function getCaregiver(caregiverId) {
  const result = await ddb.send(new GetCommand({
    TableName: CAREGIVERS_TABLE(),
    Key: { caregiverId }
  }));
  return result.Item ?? null;
}

export async function getCaregiverByEmail(email) {
  const result = await ddb.send(new QueryCommand({
    TableName: CAREGIVERS_TABLE(),
    IndexName: "EmailIndex",
    KeyConditionExpression: "email = :e",
    ExpressionAttributeValues: { ":e": email }
  }));
  return result.Items?.[0] ?? null;
}

export async function putCaregiver(item) {
  await ddb.send(new PutCommand({ TableName: CAREGIVERS_TABLE(), Item: item }));
}

export async function saveInteraction(interaction) {
  await ddb.send(new PutCommand({
    TableName: INTERACTIONS_TABLE(),
    Item: interaction
  }));
}

export async function saveAlert(alert) {
  await ddb.send(new PutCommand({
    TableName: ALERTS_TABLE(),
    Item: alert
  }));
}

export async function getInteractionsByPatient(patientId, limit = 50) {
  const result = await ddb.send(new QueryCommand({
    TableName: INTERACTIONS_TABLE(),
    IndexName: "PatientIdIndex",
    KeyConditionExpression: "patientId = :pid",
    ExpressionAttributeValues: { ":pid": patientId },
    ScanIndexForward: false,
    Limit: limit
  }));
  return result.Items ?? [];
}

export async function getAlertsByPatient(patientId) {
  const result = await ddb.send(new QueryCommand({
    TableName: ALERTS_TABLE(),
    IndexName: "PatientIdIndex",
    KeyConditionExpression: "patientId = :pid",
    ExpressionAttributeValues: { ":pid": patientId },
    ScanIndexForward: false
  }));
  return result.Items ?? [];
}

export async function resolveAlert(alertId) {
  await ddb.send(new UpdateCommand({
    TableName: ALERTS_TABLE(),
    Key: { alertId },
    UpdateExpression: "SET resolved = :t, resolvedAt = :ts",
    ExpressionAttributeValues: {
      ":t": true,
      ":ts": new Date().toISOString()
    }
  }));
}

export async function appendToPatientList(patientId, field, newItem) {
  await ddb.send(new UpdateCommand({
    TableName: PATIENTS_TABLE(),
    Key: { patientId },
    UpdateExpression: `SET #f = list_append(if_not_exists(#f, :empty), :newItem)`,
    ExpressionAttributeNames: { "#f": field },
    ExpressionAttributeValues: {
      ":newItem": [newItem],
      ":empty": []
    }
  }));
}

export async function updatePatientField(patientId, field, value) {
  await ddb.send(new UpdateCommand({
    TableName: PATIENTS_TABLE(),
    Key: { patientId },
    UpdateExpression: `SET #f = :v`,
    ExpressionAttributeNames: { "#f": field },
    ExpressionAttributeValues: { ":v": value }
  }));
}

export async function deleteFromPatientList(patientId, field, index) {
  await ddb.send(new UpdateCommand({
    TableName: PATIENTS_TABLE(),
    Key: { patientId },
    UpdateExpression: `REMOVE #f[${index}]`,
    ExpressionAttributeNames: { "#f": field },
  }));
}

export async function updatePatientListItem(patientId, field, index, newItem) {
  await ddb.send(new UpdateCommand({
    TableName: PATIENTS_TABLE(),
    Key: { patientId },
    UpdateExpression: `SET #f[${index}] = :item`,
    ExpressionAttributeNames: { "#f": field },
    ExpressionAttributeValues: { ":item": newItem },
  }));
}

export async function scanAllPatients() {
  const result = await ddb.send(new ScanCommand({ TableName: PATIENTS_TABLE() }));
  return result.Items ?? [];
}
