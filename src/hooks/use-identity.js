import { useSettings } from '@/hooks/use-settings';
import { generateColor, generateName } from '@/helpers/identity';

export const useIdentity = () => {
    const [user, setUser] = useSettings('user', null);

    const update = patch => {
        const next = { ...user, ...patch };
        setUser(next);
        return next;
    };

    const regenerate = () => update({ name: generateName(), color: generateColor() });

    return { user, update, regenerate };
};
