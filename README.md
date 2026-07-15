# Atlas

O **Atlas** é uma plataforma de gerenciamento de projetos baseada em **Kanban**, desenvolvida como um projeto de portfólio com foco em boas práticas de arquitetura, escalabilidade e qualidade de código.

O objetivo é oferecer uma experiência moderna para organização de tarefas e colaboração em equipe, permitindo que usuários criem boards, gerenciem tarefas, convidem colaboradores e acompanhem o progresso dos projetos de forma simples e intuitiva.

Além de reproduzir funcionalidades encontradas em ferramentas como Trello, Jira e Linear, o projeto também serve como um ambiente para aplicar conceitos utilizados em aplicações reais, incluindo autenticação, autorização, comunicação em tempo real, arquitetura modular e desenvolvimento orientado a testes.

## ✨ Funcionalidades

- Autenticação com JWT
- Gerenciamento de usuários
- Criação e gerenciamento de Boards
- Kanban com múltiplas colunas
- Gerenciamento de tarefas
- Convites para colaboradores por e-mail
- Controle de permissões por Board
- Atualizações em tempo real
- Tema claro e escuro

## 🛠️ Tecnologias

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- WebSocket
- Docker

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## 🎯 Objetivos

Este projeto tem como principais objetivos:

- Construir uma aplicação completa utilizando uma arquitetura limpa e modular.
- Aplicar boas práticas de desenvolvimento e organização de código.
- Desenvolver uma API REST segura e bem documentada.
- Implementar comunicação em tempo real utilizando WebSocket.
- Criar uma interface moderna inspirada em ferramentas como Linear, Jira e Trello.
- Servir como projeto de estudos e portfólio, simulando o desenvolvimento de um produto SaaS real.

## 🚧 Status

O projeto está em desenvolvimento e novas funcionalidades serão adicionadas conforme sua evolução.


## TODO:

1. Finalizar comentários no backend - OK
2. Implementar aceite de convites - back-end ok
3. Integrar criação/edição de boards no frontend
4. Implementar o Kanban
5. Integrar criação e edição de tarefas
6. Integrar detalhes, checklist, tags e comentários
7. Implementar perfil do usuário
8. Adicionar WebSocket
9. Criar testes
10. Melhorar segurança, documentação e deploy