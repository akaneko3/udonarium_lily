import { ImageFile } from './core/file-storage/image-file';
import { ImageStorage } from './core/file-storage/image-storage';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { Network } from './core/system';

import { ChatTab } from '@udonarium/chat-tab';
import { ChatTabList } from '@udonarium/chat-tab-list';
import { ObjectStore } from './core/synchronize-object/object-store';

export interface ChatMessageContext {
  identifier?: string;
  tabIdentifier?: string;
  originFrom?: string;
  from?: string;
  to?: string;
  name?: string;
  text?: string;
  timestamp?: number;
  tag?: string;
  dicebot?: string;
  imageIdentifier?: string;

  imagePos?: number;
  messColor?: string;
}

@SyncObject('chat')
export class ChatMessage extends ObjectNode implements ChatMessageContext {
  @SyncVar() originFrom: string;
  @SyncVar() from: string;
  @SyncVar() to: string;
  @SyncVar() name: string;
  @SyncVar() tag: string;
  @SyncVar() dicebot: string;
  @SyncVar() imageIdentifier: string;
  @SyncVar() imagePos: number;
  @SyncVar() messColor: string;

  get tabIdentifier(): string { return this.parent.identifier; }
  get text(): string { return <string>this.value }
  get timestamp(): number {
    let timestamp = this.getAttribute('timestamp');
    let num = timestamp ? +timestamp : 0;
    return Number.isNaN(num) ? 1 : num;
  }
  private _to: string;
  private _sendTo: string[] = [];
  get sendTo(): string[] {
    if (this._to !== this.to) {
      this._to = this.to;
      this._sendTo = this.to != null && 0 < this.to.trim().length ? this.to.trim().split(/\s+/) : [];
    }
    return this._sendTo;
  }
  private _tag: string;
  private _tags: string[] = [];
  get tags(): string[] {
    if (this._tag !== this.tag) {
      this._tag = this.tag;
      this._tags = this.tag != null && 0 < this.tag.trim().length ? this.tag.trim().split(/\s+/) : [];
    }
    return this._tags;
  }
  get image(): ImageFile { return ImageStorage.instance.get(this.imageIdentifier); }
  get index(): number { return this.minorIndex + this.timestamp; }
  get isDirect(): boolean { return 0 < this.sendTo.length ? true : false; }
  get isSendFromSelf(): boolean { return this.from === Network.peerContext.id || this.originFrom === Network.peerContext.id; }
  get isRelatedToMe(): boolean { return (-1 < this.sendTo.indexOf(Network.peerContext.id)) || this.isSendFromSelf ? true : false; }
  get isDisplayable(): boolean { return this.isDirect ? this.isRelatedToMe : true; }
  get isSystem(): boolean { return -1 < this.tags.indexOf('system') ? true : false; }
  get isDicebot(): boolean { return this.isSystem && this.from === 'System-BCDice' ? true : false; }
  get isSecret(): boolean { return -1 < this.tags.indexOf('secret') ? true : false; }
  get chatTabList(): ChatTabList { return ObjectStore.instance.get<ChatTabList>('ChatTabList'); }


  get chatSimpleDispFlag(): boolean {
    if( ! this.parent ){ return false ;}

    let tab : ChatTab = <ChatTab>this.parent;
    if( tab.chatSimpleDispFlag ){
      return true ;
    }else{
      return false ;
    }
  }
  
  get simpleDispFlagTime(): boolean {
    if( this.chatTabList.simpleDispFlagTime ){
      return true;
    }else{
      return false;
    }
  }
  get simpleDispFlagUserId(): boolean {
    if( this.chatTabList.simpleDispFlagUserId ){
      return true;
    }else{
      return false;
    }
  }
  
}
