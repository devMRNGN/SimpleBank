import fastify, { FastifyInstance } from 'fastify';
import { prisma } from './lib/prisma'
import { Decimal } from '@prisma/client/runtime/library';

export async function appRoutes(app: FastifyInstance) {
    app.post('/newcostumer', async (req:any, reply) => {
        const newUserData = req.body;
        try {
            const existsEmail = await prisma.user.findUnique({
                where: {
                    email: newUserData.email
                }
            });
            if(existsEmail === null) {
                const existsPhone = await prisma.user.findUnique({
                    where: {
                        telefone: newUserData.phone
                    }
                });
                if(existsPhone === null){
                    const newCostumer = await prisma.user.create({
                        data: {
                            email: newUserData.email,
                            name: newUserData.name,
                            telefone: newUserData.phone
                        }
                    });
                    const newCostumerName = newCostumer.name;
                    return reply.send({"successMessage":"Costumer " + newCostumerName + " has been registered"});
                } else {
                    return reply.send({"errorMessage":"Phone is already registered, try other"});
                }
            } else {
                return reply.send({"errorMessage": "Email is already registered, try other"});
            }
        } catch(error){
            return reply.send({"errorMessage": ""});
        }
   });

   app.post('/transfer', async (req:any, reply) => {
        const transferEmail = req.body.yourEmail;
        const receivingEmail = req.body.personEmail;
        const amount = new Decimal(+(req.body.amount))
        const transferAccount = await prisma.user.findUnique({
            where: {
                email: transferEmail
            }
        });
        const receivingAccount = await prisma.user.findUnique({
            where: {
                email: receivingEmail
            }
        });
        if(receivingAccount != null && receivingAccount != undefined) {
            if(transferAccount != null && transferAccount.saldo >= amount){
                await prisma.user.update({
                    where: {
                        id: transferAccount.id
                    },
                    data: {
                        saldo: transferAccount.saldo.sub(amount)
                    }
                });
                await prisma.user.update({
                    where: {
                        id: receivingAccount.id
                    }, 
                    data: {
                        saldo: receivingAccount.saldo.add(amount)
                    }
                });
                const newBalance = +(transferAccount.saldo.sub(amount));
                return reply.send({"successMessage": `Transfer done, new balance: ${newBalance.toLocaleString('en', {style: 'currency', currency: 'USD'})}`})
            } else {
                if(transferAccount === null) {
                    return reply.send({"errorMessage":"Costumer not found"});
                } else {
                    const newBalance = +(transferAccount.saldo);
                    return reply.send({"errorMessage":`You don't have amount, balance: ${newBalance.toLocaleString('en', {style: 'currency', currency: 'USD'})}`})
                }
            }
        } else {
            return reply.send({"errorMessage": "The costumer you tried to transfer does not exist"});
        }      
   });

   app.post('/balance', async (req: any, reply) => {
        const userEmail = req.body.email;
        try {
            const user = await prisma.user.findUnique({
                where: {
                    email: userEmail,
                }
            });
            if(user != null) {
                return reply.send({ saldo: user.saldo });
            } else {
                return reply.send({ "errorMessage": "Costumer not found" });
            }
        } catch(error) {
            return reply.send({"errorMessage": error});
        }
            
   });

   app.post('/deposit', async (req:any, reply) => {
        const accountEmail = req.body.email;
        const amountOfDeposit = new Decimal(req.body.amount);
        try {
            const depositAccount = await prisma.user.findUnique({
                where: {
                    email: accountEmail
                }
            })
            if(depositAccount != null && depositAccount != undefined){
                const newDepositAccountAmount = new Decimal(depositAccount.saldo).add(amountOfDeposit);
                await prisma.user.update({
                    where: {
                        email: depositAccount.email
                    },
                    data: {
                        saldo: newDepositAccountAmount
                    }
                });
                const newBalance = +(depositAccount.saldo.add(amountOfDeposit));
                    return reply.send(JSON.stringify({"successMessage": `Your deposit has been made, new balance: ${newBalance.toLocaleString('en', {style: 'currency', currency: 'USD'})}`}))
            } else {
                return reply.send({"errorMessage": "Costumer not found"});
            }
        }catch(error){
            return reply.send({"errorMessage": error});
        }
   });

   app.post('/withdraw', async (req:any, reply) => {
        const userEmail = req.body.email;
        const amount:Decimal = new Decimal(+(req.body.amount));
        try {
            const userAccount = await prisma.user.findUnique({
                where: {
                    email: userEmail
                }
            });
            if(userAccount != null){
                if(userAccount.saldo >= amount){
                    await prisma.user.update({
                        where: {
                            email: userAccount.email
                        },
                        data: {
                            saldo: userAccount.saldo.sub(amount)
                        }
                    });
                    const newBalance = +(userAccount.saldo.sub(amount));
                    return reply.send({"successMessage": `Withdraw done!, new balance: ${newBalance.toLocaleString("en", {style: "currency", currency: "USD"})}`});
                } else {
                    const yourBalance = +(userAccount.saldo);
                    return reply.send({"errorMessage": `You don't have amount, your balance: ${yourBalance.toLocaleString('en',{style: "currency", currency: 'USD'})}`});
                }
            } else {
                return reply.send({"errorMessage":"Costumer not found"});
            }
        }catch(error){
            return reply.send({"errorMessage": error});
        }
   });

   app.post('/makepix', async (req:any, reply) => {
        const userEmail = req.body.email;
        const pixAmount = new Decimal(req.body.amount);
        try {
            const userAccount = await prisma.user.findUnique({
                where: {
                    email: userEmail,
                }
            });
            if(userAccount != null && userAccount.saldo >= pixAmount) {
                const transferPixAmount:Decimal = new Decimal(userAccount.saldo).sub(pixAmount);
                await prisma.user.update({
                    where: {
                        id: userAccount.id,
                    },
                    data: {
                        saldo: transferPixAmount,
                    }
                });
                const newBalance = +(userAccount.saldo.sub(pixAmount));
                return reply.send({"successMessage": `Transfer done! new balance: ${newBalance.toLocaleString('en',{style: "currency", currency: 'USD'})}`});
            } else {
                if(userAccount === null) {
                    return reply.send({"errorMessage":"Costumer not found"});
                } else {
                    const yourBalance = +(userAccount.saldo);
                    return reply.send({"errorMessage":`You don't have amount, your balance: ${yourBalance.toLocaleString('en', {style: 'currency', currency: 'USD'})}`});
                }
            }
        }catch(error){
            return reply.send({"errorMessage":error});
        }
   });
}