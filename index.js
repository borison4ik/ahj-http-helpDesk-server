const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const cors = require('koa-cors');

const publicPath = path.join(__dirname, '/src/public');
const app = new Koa();

app.use(
  cors([
    {
      allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    },
  ]),
);
app.use(
  koaBody({
    urlencode: true,
    multipart: true,
  }),
);

const DATA = {
  tickets: [
    {
      id: '1',
      name: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempora consequatur eligendi sit ut molestiae adipisci, officia amet repellat? Ea illo non debitis suscipit facere laborum aliquam, nostrum voluptate doloribus distinctio.',
      status: 'false',
      created: new Date('2012-10-3').getTime(),
    },
    {
      id: '2',
      name: 'Ticket',
      status: 'false',
      created: new Date('2012-10-3').getTime(),
    },
    {
      id: '3',
      name: 'Ticket',
      status: 'false',
      created: new Date('2012-10-3').getTime(),
    },
  ],
  descriptions: [
    {
      id: '1',
      description: '111111111Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officiis, tempore molestiae fuga maxime saepe harum sit recusandae laudantium excepturi commodi id! Optio dignissimos reiciendis perspiciatis modi saepe! Odio, recusandae aut. Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis asperiores nihil mollitia nobis facilis earum sunt saepe atque eius, consequuntur corrupti officiis corporis maxime amet vel ipsum molestiae esse reprehenderit!',
    },
    {
      id: '2',
      description: '2 lorem ipsum dolor sit amet, con',
    },
    {
      id: '3',
      description: '3 lorem ipsum dolor sit amet, con',
    },
  ],
};

function getTicketFull(id) {
  try {
    const ticket = DATA.tickets.find((t) => t.id === id);
    const { description } = DATA.descriptions.find((desc) => desc.id === id);
    return { ...ticket, description };
  } catch (err) {
    return err.message;
  }
}

function createTicket(requestBody) {
  try {
    const { name, description } = requestBody;
    const id = uuid();
    const status = 'false';
    const created = new Date().getTime();
    const newTicket = { id, name, status, created };
    DATA.tickets.push(newTicket);
    DATA.descriptions.push({ id, description });

    return newTicket;
  } catch (err) {
    return err.message;
  }
}

function changeTicket(requestBody) {
  try {
    const { id, name, description, status } = requestBody;
    const changedTicked = DATA.tickets.find((ticket) => ticket.id === id);

    if (status !== undefined) changedTicked.status = status;
    if (name !== undefined) changedTicked.name = name;
    if (description !== undefined) {
      const changedDescription = DATA.descriptions.find((ticket) => ticket.id === id);
      changedDescription.description = description;
    }

    return changedTicked;
  } catch (err) {
    return err.message;
  }
}

function deleteTicket(id) {
  try {
    DATA.tickets = DATA.tickets.filter((ticket) => ticket.id !== id);
    DATA.descriptions = DATA.descriptions.filter((description) => description.id !== id);
    return true;
  } catch (err) {
    return err.message;
  }
}

app.use(async (ctx) => {
  if (ctx.method === 'GET') {
    const { method, id } = ctx.request.query;

    switch (method) {
      case 'allTickets':
        ctx.response.body = { status: 'success', data: DATA.tickets };
        return;
      case 'ticketById':
        ctx.response.body = { status: 'success', data: getTicketFull(id) };
        return;
      default:
        ctx.response.status = 404;
        ctx.response.body = { status: 'error', data: 'Not Found' };
        return;
    }
  } else if (ctx.method === 'POST') {
    const { method } = ctx.request.body;

    switch (method) {
      case 'createTicket':
        ctx.response.status = 201;
        ctx.response.body = { status: 'success', data: createTicket(ctx.request.body) };
        return;
      default:
        ctx.response.status = 404;
        return;
    }
  } else if (ctx.method === 'PUT') {
    const { method } = ctx.request.body;
    switch (method) {
      case 'changeTicket':
        console.log(ctx.request.body);
        ctx.response.status = 201;
        ctx.response.body = { status: 'success', data: changeTicket(ctx.request.body) };
        return;
      default:
        ctx.response.status = 404;
        return;
    }
  } else if (ctx.method === 'DELETE') {
    const { id } = ctx.request.query;
    console.log(ctx.request.body); // не понял почему в DELETE нет body вроде в интернете ссылки на спеку жают что разрешено
    console.log(ctx.request.query);
    ctx.response.status = 202;
    ctx.response.body = deleteTicket(id);
  }
});

const server = http.createServer(app.callback()).listen(7070);
