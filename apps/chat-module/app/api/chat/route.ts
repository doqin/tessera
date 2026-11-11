import { handleChatRequest, handleOptions } from "../../../services/groqProxy";

export const dynamic = "force-dynamic";

export const POST = handleChatRequest;
export const OPTIONS = handleOptions;
