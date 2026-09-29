import { InteractionManager } from 'react-native';

export function afterUi(task: () => void, delayMs = 350) {
  InteractionManager.runAfterInteractions(() => {
    setTimeout(task, delayMs);
  });
}
