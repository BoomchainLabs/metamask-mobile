import {
  AccountsControllerAccountAddedEvent,
  AccountsControllerAccountRemovedEvent,
  AccountsControllerListMultichainAccountsAction,
  AccountsControllerAccountBalancesUpdatesEvent,
} from '@metamask/accounts-controller';
import { HandleSnapRequest } from '@metamask/snaps-controllers';
import {
  MultichainAssetsControllerGetStateAction,
  MultichainAssetsControllerAccountAssetListUpdatedEvent,
} from '@metamask/assets-controllers';

export type MultichainBalancesControllerActions =
  | AccountsControllerListMultichainAccountsAction
  | HandleSnapRequest
  | MultichainAssetsControllerGetStateAction;

export type MultichainBalancesControllerEvents =
  | AccountsControllerAccountAddedEvent
  | AccountsControllerAccountRemovedEvent
  | AccountsControllerAccountBalancesUpdatesEvent
  | MultichainAssetsControllerAccountAssetListUpdatedEvent;
