import path from "path";
import express, {Express, NextFunction, Request, Response} from "express";
import { serverInfo } from "./serverInfo";
import * as SMTP from "./smtp";
import * as Contacts from "./contacts";
import { IContact } from "./contacts";

const app: Express = express();
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "../../client/dist"))
);

app.listen(8080);

app.use(function(inRequest: Request, inResponse: Response, inNext: NextFunction)
{
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-Width,Content-Type,Accept");
    inNext();
});


app.post("/messages", async (inRequest: Request, inResponse: Response) => {
    try {
        console.log("Received a message request:", inRequest.body);
        const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
        await smtpWorker.sendMessage(inRequest.body);
        inResponse.send("ok");
    } catch (inError) {
        console.error("Error processing message request:", inError);
        inResponse.send("error");
    }
});


app.get("/contacts",
    async (inRequest: Request, inResponse: Response) => {
        try{
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            const contacts: IContact[] = await contactsWorker.listContacts();
            inResponse.json(contacts);
        }catch(inError){
            inResponse.send("error");
        }
    }
);

app.post("/contacts",
    async(inRequest: Request, inResponse: Response) =>{
        try{
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            const contact: IContact = await contactsWorker.addContact(inRequest.body);
            inResponse.json(contact);
        }catch(inError){
            inResponse.send("error");
        }
    }
);

app.delete("/contacts/:id",
    async(inRequest: Request, inResponse: Response) =>{
        try{
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            await contactsWorker.deleteContact(inRequest.params.id);
            inResponse.send("ok");
        }catch(inError){
            inResponse.send("error");
        }
    }
);
