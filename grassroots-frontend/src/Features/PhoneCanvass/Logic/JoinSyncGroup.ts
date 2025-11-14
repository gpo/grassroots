import { SyncClient } from "twilio-sync";
import { CallPartyStateStore } from "./CallPartyStateStore.js";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

interface JoinSyncGroupParams {
  identity: PhoneCanvassCallerDTO;
  callPartyStateStore: CallPartyStateStore;
  authToken: string;
}

export async function joinSyncGroup(
  params: JoinSyncGroupParams,
): Promise<void> {
  const { identity, authToken, callPartyStateStore } = params;
  const syncClient = new SyncClient(authToken);

  const doc = await syncClient.document(identity.activePhoneCanvassId);

  syncClient.on("connectionStateChanged", () => {
    callPartyStateStore.setData(doc.data);
  });

  callPartyStateStore.setData(doc.data);

  doc.on("updated", () => {
    callPartyStateStore.setData(doc.data);
  });
}
