import { Injectable } from "@nestjs/common";

type NotificationCopy = {
  title: string;
  message: string;
};

@Injectable()
export class NotificationMessagesService {
  boardInvitation(actorName: string, boardName: string): NotificationCopy {
    return {
      title: "Você recebeu um convite para um board",
      message: `${actorName} convidou você para participar do board "${boardName}".`,
    };
  }

  taskAssigned(actorName: string, taskTitle: string): NotificationCopy {
    return {
      title: "Você foi atribuído a uma tarefa",
      message: `${actorName} atribuiu você à tarefa "${taskTitle}".`,
    };
  }

  taskMoved(
    actorName: string,
    taskTitle: string,
    fromColumnName: string,
    toColumnName: string,
    sameColumn: boolean,
  ): NotificationCopy {
    return {
      title: "Tarefa movimentada",
      message: sameColumn
        ? `${actorName} reordenou a tarefa "${taskTitle}" na coluna "${toColumnName}".`
        : `${actorName} moveu a tarefa "${taskTitle}" de "${fromColumnName}" para "${toColumnName}".`,
    };
  }

  taskCommented(actorName: string, taskTitle: string): NotificationCopy {
    return {
      title: "Novo comentário em uma tarefa",
      message: `${actorName} comentou na tarefa "${taskTitle}".`,
    };
  }
}
