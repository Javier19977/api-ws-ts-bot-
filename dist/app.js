import "dotenv/config";
import { createBot, createFlow, MemoryDB, createProvider, addKeyword } from '@bot-whatsapp/bot';
import { BaileysProvider, handleCtx } from '@bot-whatsapp/provider-baileys';

const flowBienvenida = addKeyword('hola').addAnswer('¡Buenas! Bienvenido');

/**
 * Función principal del servidor
 */
const main = async () => {
    const provider = createProvider(BaileysProvider);
    provider.initHttpServer(3002);

    // Endpoint para recibir solicitudes de envío de mensaje
    provider.http.server.post('/send-message', handleCtx(async (bot, req, res) => {
        try {
            let { numbers, message, mediaUrl } = req.body;

            // Validación de datos
            if (!numbers || !message) {
                return res.end(JSON.stringify({ error: "Los números y el mensaje son obligatorios." }));
            }

            // Asegurar que numbers sea un array
            const phoneNumbers = Array.isArray(numbers) ? numbers : [numbers];

            // Filtrar números inválidos
            const validNumbers = phoneNumbers.filter(num => typeof num === "string" && num.trim() !== "");

            if (validNumbers.length === 0) {
                return res.end(JSON.stringify({ error: "No se proporcionaron números válidos." }));
            }

            // Enviar los mensajes en paralelo
            const results = await Promise.all(validNumbers.map(async (number) => {
                try {
                    // Aquí puedes añadir el formato correcto de número, si es necesario
                    const phone = `${number}@s.whatsapp.net`;
                    await bot.sendMessage(phone, message, { media: mediaUrl || undefined });
                    return { number, status: "success" };
                } catch (error) {
                    console.error(`Error con ${number}:`, error);
                    return { number, status: "error", error: error.message };
                }
            }));

            return res.end(JSON.stringify({ success: true, results }));
        } catch (error) {
            console.error("Error en la API:", error);
            return res.end(JSON.stringify({ error: "Error interno en el servidor." }));
        }
    }));

    await createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(), // Se agregó "()" para instanciar MemoryDB
        provider
    });
};

main();
