# Notificações em tempo real

A API expõe um namespace Socket.IO em `/notifications`. O cliente deve enviar o
access token atual exclusivamente no handshake:

```ts
io(`${apiUrl}/notifications`, {
  auth: { token: accessToken },
});
```

O servidor valida assinatura e expiração do JWT, confirma que o usuário ainda
existe e deriva a identidade de `sub`. `userId` enviado por query, body ou pelo
próprio cliente não é aceito como identidade. Uma autenticação inválida recusa a
conexão.

Cada conexão autenticada entra na room `user:{userId}`. Assim, todas as abas,
navegadores e dispositivos conectados com o mesmo usuário recebem o evento:

```text
notification:new
```

Payload:

```json
{
  "id": "b906bb26-a72c-449e-9d95-0cf2ed4f0886",
  "type": "TASK_MOVED",
  "title": "Tarefa movimentada",
  "message": "Leonardo moveu a tarefa \"Criar login\" de \"A fazer\" para \"Em andamento\".",
  "data": {
    "boardId": "board-id",
    "taskId": "task-id",
    "taskTitle": "Criar login",
    "fromColumnId": "column-id",
    "fromColumnName": "A fazer",
    "toColumnId": "other-column-id",
    "toColumnName": "Em andamento",
    "movedByUserId": "user-id"
  },
  "readAt": null,
  "createdAt": "2026-07-27T12:00:00.000Z"
}
```

A notificação é persistida antes da emissão. Receber o evento não altera
`readAt`; a leitura deve ser registrada pela API HTTP. Se o cliente estiver
offline ou a emissão falhar, a notificação permanece disponível em
`GET /notifications`.

## Limitação de escala

Não há Redis nem adapter Socket.IO compartilhado neste projeto. Em uma execução
com múltiplas instâncias, o evento alcança somente conexões ligadas à mesma
instância que realizou a emissão. A persistência no PostgreSQL continua
garantindo a recuperação pela API após reconexão.
