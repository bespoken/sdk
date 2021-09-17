export = EmailNotifier;
/**
 *
 */
declare class EmailNotifier {
    /**
     *
     */
    static instance(): any;
    /**
     *
     */
    content(): {
        subject: string;
        body: string;
    };
    /**
     *
     */
    send(): Promise<void>;
    /**
     *
     */
    get canSend(): string;
}
