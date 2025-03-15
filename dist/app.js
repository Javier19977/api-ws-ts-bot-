import "dotenv/config";
import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from '@bot-whatsapp/bot';
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';
const flowBienvenida = addKeyword('hola').addAnswer('¡Buenas! Bienvenido');
/**
 *
 */
const main = async () => {
    const provider = createProvider(BaileysProvider);
    provider.initHttpServer(3002);
    provider.http.server.get('/send-message', handleCtx(async (bot, req, res) => {
        const body = req.body; // Corregido "re.body" a "req.body"
        const message = body.message;
        const mediaUrl = body.mediaUrl;
        await bot.sendMessage(process.env.FRIEND_NUMBER, message, {
            media: mediaUrl // Se movió dentro del objeto de opciones correctamente
        });
        res.end('esto va en el servidor de polka');
    }));
    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(), // Se agregó "()" para instanciar MemoryDB
        provider
    });
};
main();
