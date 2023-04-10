import fetch from 'node-fetch';
import crypto from 'crypto';
import formurlencoded from 'form-urlencoded';
import latex from 'asciimath-to-latex';

export const hashUtil = input => BigInt(`0x${crypto.createHash('md5').update(input).digest('hex')}`).toString(36).substring(0, 10);

export const texUtil = expression => (latex as any).default(expression);

type Color = `#${string}`;

interface BaseItem {
    id: number;
    type: "expression" | "text";
}

interface Expression extends BaseItem {
    type: "expression";
    color?: Color;
    latex: string;
}

interface Text extends BaseItem {
    type: "text";
    text: string;
}

export type Item = Expression | Text;

export interface Options {
    color?: Color;
}

interface DesmosResponse {
    hash: string;
    thumbUrl: string;
    stateUrl: string;
    access: string;
    created: string;
}

interface GraphOptions {
    items?: Item[];
}

export class Graph {
    items: Item[];
    url: string | null;

    constructor (optionsOrExpression: GraphOptions | string = {}) {
        if (typeof optionsOrExpression == "string") {
            this.items = [{
                id: 0,
                type: "expression",
                latex: optionsOrExpression
            }];
        }
        else this.items = optionsOrExpression.items ?? [];
        this.url = null;
    }

    get #graphHash () {
        return hashUtil(this.#calcState + Date.now());
    }

    get #calcState () {
        return JSON.stringify({
            version: 10,
            randomSeed: "d38b7605c8b828d4d0d0428f3014c6dc",
            graph: {
                viewport: {
                    xmin: -10,
                    ymin: -13.23682387134957,
                    xmax: 10,
                    ymax: 13.23682387134957
                }
            },
            expressions: {
                list: this.items
            }
        });
    }

    get #thumbData () {
        return decodeURIComponent("data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAAAXNSR0IArs4c6QAAGxxJREFUeF7t2UFuHAeyBmEKPsRgzMXcgvdf8xScRRvwIQw%2BQHjSQkuGGvgx%2BXnPVlVEZgZQ%2Fvb5%2Bfn5Mvzff%2F%2F73%2B9P95%2F%2F%2FGfyKT1f07LK788%2F%2F%2Fz5Yn%2F99Vd7ySf%2B9Sq%2FH6%2Fs%2BZr8dX7fBOR%2FW%2FD6AK4%2Bn4C0vRCQG%2FwEJHpePYAWuIkVkMbP%2FN3gJyDRs4A0gKv8BKR5FZAb%2FAQkel49gBa4iRWQxs%2F83eAnINGzgDSAq%2FwEpHkVkBv8BCR6Xj2AFriJFZDGz%2Fzd4Ccg0bOANICr%2FASkeRWQG%2FwEJHpePYAWuIkVkMbP%2FN3gJyDRs4A0gKv8BKR5FZAb%2FAQkel49gBa4iRWQxs%2F83eAnINGzgDSAq%2FwEpHkVkBv8BCR6Xj2AFriJFZDGz%2Fzd4Ccg0bOANICr%2FASkeRWQG%2FwEJHpePYAWuIkVkMbP%2FN3gJyDRs4A0gKv8BKR5FZAb%2FAQkel49gBa4iRWQxs%2F83eAnINGzgDSAq%2FwEpHkVkBv8BCR6Xj2AFriJFZDGz%2Fzd4Ccg0bOANICr%2FASkeRWQG%2FwEJHpePYAWuIkVkMbP%2FN3gJyDRs4A0gKv8BKR5FZAb%2FAQkel49gBa4iRWQxs%2F83eAnINGzgDSAq%2FwEpHkVkBv8BCR6Xj2AFriJFZDGz%2Fzd4Ccg0bOANICr%2FASkeRWQG%2FwEJHpePYAWuIkVkMbP%2FN3gJyDRs4A0gKv8BKR5FZAb%2FAQkel49gBa4iRWQxs%2F83eAnINGzgDSAq%2FwEpHkVkBv8BCR6Xj2AFriJFZDGz%2Fzd4Ccg0bOANICr%2FASkeRWQG%2FwEJHpePYAWuIkVkMbP%2FN3gJyDRs4A0gKv8BKR5FZAb%2FAQkel49gBa4iRWQxs%2F83eAnINGzgDSAq%2FwEpHkVkBv8BCR6Xj2AFriJFZDGz%2Fzd4Ccg0bOANICr%2FASkeRWQG%2FwEJHpePYAWuIkVkMbP%2FN3gJyDRs4A0gKv8BKR5FZAb%2FL59fHx8%2Fp5Xfc6vPB6P7z%2F8%2Bvr6nH8g%2FqrnawBX%2Bb29vf18sff39%2FaST%2FzrVX4%2FXtnzNfnr%2FASk%2BX1ZF%2Bz5viZYQL7G7de%2FMn%2BN4zo%2Fn7Ca35fVTzA%2BITSxPmE1fubvBj8BiZ4FpAFc5ScgzauA3OAnINHz6gG0wE2sgDR%2B5u8GPwGJngWkAVzlJyDNq4Dc4Ccg0fPqAbTATayANH7m7wY%2FAYmeBaQBXOUnIM2rgNzgJyDR8%2BoBtMBNrIA0fubvBj8BiZ4FpAFc5ScgzauA3OAnINHz6gG0wE2sgDR%2B5u8GPwGJngWkAVzlJyDNq4Dc4Ccg0fPqAbTATayANH7m7wY%2FAYmeBaQBXOUnIM2rgNzgJyDR8%2BoBtMBNrIA0fubvBj8BiZ4FpAFc5ScgzauA3OAnINHz6gG0wE2sgDR%2B5u8GPwGJngWkAVzlJyDNq4Dc4Ccg0fPqAbTATayANH7m7wY%2FAYmeBaQBXOUnIM2rgNzgJyDR8%2BoBtMBNrIA0fubvBj8BiZ4FpAFc5ScgzauA3OAnINHz6gG0wE2sgDR%2B5u8GPwGJngWkAVzlJyDNq4Dc4Ccg0fPqAbTATayANH7m7wY%2FAYmeBaQBXOUnIM2rgNzgJyDR8%2BoBtMBNrIA0fubvBj8BiZ4FpAFc5ScgzauA3OAnINHz6gG0wE2sgDR%2B5u8GPwGJngWkAVzlJyDNq4Dc4Ccg0fPqAbTATayANH7m7wY%2FAYmeBaQBXOUnIM2rgNzgJyDR8%2BoBtMBNrIA0fubvBj8BiZ4FpAFc5ScgzauA3OAnINHz6gG0wE2sgDR%2B5u8GPwGJngWkAVzlJyDNq4Dc4Ccg0fPqAbTATayANH7m7wY%2FAYmeBaQBXOUnIM2rgNzgJyDR8%2BoBtMBNrIA0fubvBj8BiZ4FpAFc5ScgzauA3OD37ePj4%2FP3vOpzfuXxeHz%2F4dfX1%2Bf8A%2FFXPV8DuMrv7e3t54u9v7%2B3l3ziX6%2Fy%2B%2FHKnq%2FJX%2BcnIM3vy7pgz%2Fc1wQLyNW6%2F%2FpX5axzX%2BfmE1fy%2BrH6C8QmhifUJq%2FEzfzf4CUj0LCAN4Co%2FAWleBeQGPwGJnlcPoAVuYgWk8TN%2FN%2FgJSPQsIA3gKj8BaV4F5AY%2FAYmeVw%2BgBW5iBaTxM383%2BAlI9CwgDeAqPwFpXgXkBj8BiZ5XD6AFbmIFpPEzfzf4CUj0LCAN4Co%2FAWleBeQGPwGJnlcPoAVuYgWk8TN%2FN%2FgJSPQsIA3gKj8BaV4F5AY%2FAYmeVw%2BgBW5iBaTxM383%2BAlI9CwgDeAqPwFpXgXkBj8BiZ5XD6AFbmIFpPEzfzf4CUj0LCAN4Co%2FAWleBeQGPwGJnlcPoAVuYgWk8TN%2FN%2FgJSPQsIA3gKj8BaV4F5AY%2FAYmeVw%2BgBW5iBaTxM383%2BAlI9CwgDeAqPwFpXgXkBj8BiZ5XD6AFbmIFpPEzfzf4CUj0LCAN4Co%2FAWleBeQGPwGJnlcPoAVuYgWk8TN%2FN%2FgJSPQsIA3gKj8BaV4F5AY%2FAYmeVw%2BgBW5iBaTxM383%2BAlI9CwgDeAqPwFpXgXkBj8BiZ5XD6AFbmIFpPEzfzf4CUj0LCAN4Co%2FAWleBeQGPwGJnlcPoAVuYgWk8TN%2FN%2FgJSPQsIA3gKj8BaV4F5AY%2FAYmeVw%2BgBW5iBaTxM383%2BAlI9CwgDeAqPwFpXgXkBj8BiZ5XD6AFbmIFpPEzfzf4CUj0LCAN4Co%2FAWleBeQGPwGJnlcPoAVuYgWk8TN%2FN%2FgJSPQsIA3gKj8BaV4F5AY%2FAYmeVw%2BgBW5iBaTxM383%2BAlI9CwgDeAqPwFpXgXkBj8BiZ5XD6AFbmIFpPEzfzf4CUj0LCAN4Co%2FAWleBeQGv28fHx%2Bfv%2BdVn%2FMrj8fj%2Bw%2B%2Fvr4%2B5x%2BIv%2Br5GsBVfm9vbz9f7P39vb3kE%2F96ld%2BPV%2FZ8Tf46PwFpfl%2FWBXu%2BrwkWkK9x%2B%2FWvzF%2FjuM7PJ6zm92X1E4xPCE2sT1iNn%2Fm7wU9AomcBaQBX%2BQlI8yogN%2FgJSPS8egAtcBMrII2f%2BbvBT0CiZwFpAFf5CUjzKiA3%2BAlI9Lx6AC1wEysgjZ%2F5u8FPQKJnAWkAV%2FkJSPMqIDf4CUj0vHoALXATKyCNn%2Fm7wU9AomcBaQBX%2BQlI8yogN%2FgJSPS8egAtcBMrII2f%2BbvBT0CiZwFpAFf5CUjzKiA3%2BAlI9Lx6AC1wEysgjZ%2F5u8FPQKJnAWkAV%2FkJSPMqIDf4CUj0vHoALXATKyCNn%2Fm7wU9AomcBaQBX%2BQlI8yogN%2FgJSPS8egAtcBMrII2f%2BbvBT0CiZwFpAFf5CUjzKiA3%2BAlI9Lx6AC1wEysgjZ%2F5u8FPQKJnAWkAV%2FkJSPMqIDf4CUj0vHoALXATKyCNn%2Fm7wU9AomcBaQBX%2BQlI8yogN%2FgJSPS8egAtcBMrII2f%2BbvBT0CiZwFpAFf5CUjzKiA3%2BAlI9Lx6AC1wEysgjZ%2F5u8FPQKJnAWkAV%2FkJSPMqIDf4CUj0vHoALXATKyCNn%2Fm7wU9AomcBaQBX%2BQlI8yogN%2FgJSPS8egAtcBMrII2f%2BbvBT0CiZwFpAFf5CUjzKiA3%2BAlI9Lx6AC1wEysgjZ%2F5u8FPQKJnAWkAV%2FkJSPMqIDf4CUj0vHoALXATKyCNn%2Fm7wU9AomcBaQBX%2BQlI8yogN%2FgJSPS8egAtcBMrII2f%2BbvBT0CiZwFpAFf5CUjzKiA3%2BAlI9Lx6AC1wEysgjZ%2F5u8FPQKJnAWkAV%2FkJSPMqIDf4CUj0vHoALXATKyCNn%2Fm7wU9AomcBaQBX%2BQlI8yogN%2Fh9%2B%2Fj4%2BPw9r%2FqcX3k8Ht9%2F%2BPX19Tn%2FQPxVz9cArvJ7e3v7%2BWLv7%2B%2FtJZ%2F416v8fryy52vy1%2FkJSPP7si7Y831NsIB8jduvf2X%2BGsd1fj5hNb8vq59gfEJoYn3CavzM3w1%2BAhI9C0gDuMpPQJpXAbnBT0Ci59UDaIGbWAFp%2FMzfDX4CEj0LSAO4yk9AmlcBucFPQKLn1QNogZtYAWn8zN8NfgISPQtIA7jKT0CaVwG5wU9AoufVA2iBm1gBafzM3w1%2BAhI9C0gDuMpPQJpXAbnBT0Ci59UDaIGbWAFp%2FMzfDX4CEj0LSAO4yk9AmlcBucFPQKLn1QNogZtYAWn8zN8NfgISPQtIA7jKT0CaVwG5wU9AoufVA2iBm1gBafzM3w1%2BAhI9C0gDuMpPQJpXAbnBT0Ci59UDaIGbWAFp%2FMzfDX4CEj0LSAO4yk9AmlcBucFPQKLn1QNogZtYAWn8zN8NfgISPQtIA7jKT0CaVwG5wU9AoufVA2iBm1gBafzM3w1%2BAhI9C0gDuMpPQJpXAbnBT0Ci59UDaIGbWAFp%2FMzfDX4CEj0LSAO4yk9AmlcBucFPQKLn1QNogZtYAWn8zN8NfgISPQtIA7jKT0CaVwG5wU9AoufVA2iBm1gBafzM3w1%2BAhI9C0gDuMpPQJpXAbnBT0Ci59UDaIGbWAFp%2FMzfDX4CEj0LSAO4yk9AmlcBucFPQKLn1QNogZtYAWn8zN8NfgISPQtIA7jKT0CaVwG5wU9AoufVA2iBm1gBafzM3w1%2BAhI9C0gDuMpPQJpXAbnBT0Ci59UDaIGbWAFp%2FMzfDX4CEj0LSAO4yk9AmlcBucFPQKLn1QNogZtYAWn8zN8NfgISPQtIA7jKT0CaVwG5we%2Fbv%2F%2F978%2Ff86rP%2BZV%2F%2Fvnn%2Bw%2F%2F8ccfz%2FkH4q96vgZwld%2Fff%2F%2F988X%2B9a9%2FtZd84l%2Bv8vvxyp6vyV%2FnJyDN78u6YM%2F3NcEC8jVuv%2F6V%2BWsc1%2FkJSPMrIP%2Bj%2FAQkiv3%2FP18%2FgJ6vefb%2FQBq%2Fl9Vv%2BL5BN7H%2BH0jjZ%2F5u8BOQ6FlAGsBVfgLSvArIDX4CEj2vHkAL3MQKSONn%2Fm7wE5DoWUAawFV%2BAtK8CsgNfgISPa8eQAvcxApI42f%2BbvATkOhZQBrAVX4C0rwKyA1%2BAhI9rx5AC9zECkjjZ%2F5u8BOQ6FlAGsBVfgLSvArIDX4CEj2vHkAL3MQKSONn%2Fm7wE5DoWUAawFV%2BAtK8CsgNfgISPa8eQAvcxApI42f%2BbvATkOhZQBrAVX4C0rwKyA1%2BAhI9rx5AC9zECkjjZ%2F5u8BOQ6FlAGsBVfgLSvArIDX4CEj2vHkAL3MQKSONn%2Fm7wE5DoWUAawFV%2BAtK8CsgNfgISPa8eQAvcxApI42f%2BbvATkOhZQBrAVX4C0rwKyA1%2BAhI9rx5AC9zECkjjZ%2F5u8BOQ6FlAGsBVfgLSvArIDX4CEj2vHkAL3MQKSONn%2Fm7wE5DoWUAawFV%2BAtK8CsgNfgISPa8eQAvcxApI42f%2BbvATkOhZQBrAVX4C0rwKyA1%2BAhI9rx5AC9zECkjjZ%2F5u8BOQ6FlAGsBVfgLSvArIDX4CEj2vHkAL3MQKSONn%2Fm7wE5DoWUAawFV%2BAtK8CsgNfgISPa8eQAvcxApI42f%2BbvATkOhZQBrAVX4C0rwKyA1%2BAhI9rx5AC9zECkjjZ%2F5u8BOQ6FlAGsBVfgLSvArIDX4CEj2vHkAL3MQKSONn%2Fm7wE5DoWUAawFV%2BAtK8CsgNfgISPa8eQAvcxApI42f%2BbvATkOhZQBrAVX4C0rwKyA1%2BAhI9rx5AC9zECkjjZ%2F5u8BOQ6FlAGsBVfgLSvArIDX4CEj2vHkAL3MQKSONn%2Fm7w%2B%2Fbx8fH5e171Ob%2FyeDy%2B%2F%2FDr6%2Btz%2FoH4q56vAVzl9%2Fb29vPF3t%2Ff20s%2B8a9X%2Bf14Zc%2FX5K%2FzE5Dm92VdsOf7mmAB%2BRq3X%2F%2FK%2FDWO6%2Fx8wmp%2BX3zCagBX%2BfmE1bz6hHWDn4BEz6sH0AI3sQLS%2BJm%2FG%2FwEJHoWkAZwlZ%2BANK8CcoOfgETPqwfQAjexAtL4mb8b%2FAQkehaQBnCVn4A0rwJyg5%2BARM%2BrB9ACN7EC0viZvxv8BCR6FpAGcJWfgDSvAnKDn4BEz6sH0AI3sQLS%2BJm%2FG%2FwEJHoWkAZwlZ%2BANK8CcoOfgETPqwfQAjexAtL4mb8b%2FAQkehaQBnCVn4A0rwJyg5%2BARM%2BrB9ACN7EC0viZvxv8BCR6FpAGcJWfgDSvAnKDn4BEz6sH0AI3sQLS%2BJm%2FG%2FwEJHoWkAZwlZ%2BANK8CcoOfgETPqwfQAjexAtL4mb8b%2FAQkehaQBnCVn4A0rwJyg5%2BARM%2BrB9ACN7EC0viZvxv8BCR6FpAGcJWfgDSvAnKDn4BEz6sH0AI3sQLS%2BJm%2FG%2FwEJHoWkAZwlZ%2BANK8CcoOfgETPqwfQAjexAtL4mb8b%2FAQkehaQBnCVn4A0rwJyg5%2BARM%2BrB9ACN7EC0viZvxv8BCR6FpAGcJWfgDSvAnKDn4BEz6sH0AI3sQLS%2BJm%2FG%2FwEJHoWkAZwlZ%2BANK8CcoOfgETPqwfQAjexAtL4mb8b%2FAQkehaQBnCVn4A0rwJyg5%2BARM%2BrB9ACN7EC0viZvxv8BCR6FpAGcJWfgDSvAnKDn4BEz6sH0AI3sQLS%2BJm%2FG%2FwEJHoWkAZwlZ%2BANK8CcoOfgETPqwfQAjexAtL4mb8b%2FAQkehaQBnCVn4A0rwJyg5%2BARM%2BrB9ACN7EC0viZvxv8BCR6FpAGcJWfgDSvAnKDn4BEz6sH0AI3sQLS%2BJm%2FG%2Fy%2BfXx8fP6eV33Orzwej%2B8%2F%2FPr6%2Bpx%2FIP6q52sAV%2Fm9vb39fLH39%2Ff2kk%2F861V%2BP17Z8zX56%2FwEpPl9WRfs%2Bb4mWEC%2Bxu3XvzJ%2FjeM6P5%2Bwmt8Xn7AawFV%2BPmE1rz5h3eAnINHz6gG0wE2sgDR%2B5u8GPwGJngWkAVzlJyDNq4Dc4Ccg0fPqAbTATayANH7m7wY%2FAYmeBaQBXOUnIM2rgNzgJyDR8%2BoBtMBNrIA0fubvBj8BiZ4FpAFc5ScgzauA3OAnINHz6gG0wE2sgDR%2B5u8GPwGJngWkAVzlJyDNq4Dc4Ccg0fPqAbTATayANH7m7wY%2FAYmeBaQBXOUnIM2rgNzgJyDR8%2BoBtMBNrIA0fubvBj8BiZ4FpAFc5ScgzauA3OAnINHz6gG0wE2sgDR%2B5u8GPwGJngWkAVzlJyDNq4Dc4Ccg0fPqAbTATayANH7m7wY%2FAYmeBaQBXOUnIM2rgNzgJyDR8%2BoBtMBNrIA0fubvBj8BiZ4FpAFc5ScgzauA3OAnINHz6gG0wE2sgDR%2B5u8GPwGJngWkAVzlJyDNq4Dc4Ccg0fPqAbTATayANH7m7wY%2FAYmeBaQBXOUnIM2rgNzgJyDR8%2BoBtMBNrIA0fubvBj8BiZ4FpAFc5ScgzauA3OAnINHz6gG0wE2sgDR%2B5u8GPwGJngWkAVzlJyDNq4Dc4Ccg0fPqAbTATayANH7m7wY%2FAYmeBaQBXOUnIM2rgNzgJyDR8%2BoBtMBNrIA0fubvBj8BiZ4FpAFc5ScgzauA3OAnINHz6gG0wE2sgDR%2B5u8GPwGJngWkAVzlJyDNq4Dc4Ccg0fPqAbTATayANH7m7wY%2FAYmeBaQBXOUnIM2rgNzgJyDR8%2BoBtMBNrIA0fubvBj8BiZ4FpAFc5ScgzauA3OAnINHz6gG0wE2sgDR%2B5u8Gv28fHx%2Bfv%2BdVn%2FMrj8fj%2Bw%2B%2Fvr4%2B5x%2BIv%2Br5GsBVfm9vbz9f7P39vb3kE%2F96ld%2BPV%2FZ8Tf46PwFpfl%2FWBXu%2BrwkWkK9x%2B%2FWvzF%2FjuM7PJ6zm98UnrAZwlZ9PWM2rT1g3%2BAlI9Lx6AC1wEysgjZ%2F5u8FPQKJnAWkAV%2FkJSPMqIDf4CUj0vHoALXATKyCNn%2Fm7wU9AomcBaQBX%2BQlI8yogN%2FgJSPS8egAtcBMrII2f%2BbvBT0CiZwFpAFf5CUjzKiA3%2BAlI9Lx6AC1wEysgjZ%2F5u8FPQKJnAWkAV%2FkJSPMqIDf4CUj0vHoALXATKyCNn%2Fm7wU9AomcBaQBX%2BQlI8yogN%2FgJSPS8egAtcBMrII2f%2BbvBT0CiZwFpAFf5CUjzKiA3%2BAlI9Lx6AC1wEysgjZ%2F5u8FPQKJnAWkAV%2FkJSPMqIDf4CUj0vHoALXATKyCNn%2Fm7wU9AomcBaQBX%2BQlI8yogN%2FgJSPS8egAtcBMrII2f%2BbvBT0CiZwFpAFf5CUjzKiA3%2BAlI9Lx6AC1wEysgjZ%2F5u8FPQKJnAWkAV%2FkJSPMqIDf4CUj0vHoALXATKyCNn%2Fm7wU9AomcBaQBX%2BQlI8yogN%2FgJSPS8egAtcBMrII2f%2BbvBT0CiZwFpAFf5CUjzKiA3%2BAlI9Lx6AC1wEysgjZ%2F5u8FPQKJnAWkAV%2FkJSPMqIDf4CUj0vHoALXATKyCNn%2Fm7wU9AomcBaQBX%2BQlI8yogN%2FgJSPS8egAtcBMrII2f%2BbvBT0CiZwFpAFf5CUjzKiA3%2BAlI9Lx6AC1wEysgjZ%2F5u8FPQKJnAWkAV%2FkJSPMqIDf4CUj0vHoALXATKyCNn%2Fm7wU9AomcBaQBX%2BQlI8yogN%2FgJSPS8egAtcBMrII2f%2BbvBT0CiZwFpAFf5CUjzKiA3%2BAlI9Lx6AC1wEysgjZ%2F5u8Hv28fHx%2BfvedXn%2FMrj8fj%2Bw6%2Bvr8%2F5B%2BKver4GcJXf29vbzxd7f39vL%2FnEv17l9%2BOVPV%2BTv85PQJrfl3XBnu9rggXka9x%2B%2FSvz1ziu8%2FMJq%2Fl98QmrAVzl5xNW8%2BoT1g1%2BAhI9rx5AC9zECkjjZ%2F5u8BOQ6FlAGsBVfgLSvArIDX4CEj2vHkAL3MQKSONn%2Fm7wE5DoWUAawFV%2BAtK8CsgNfgISPa8eQAvcxApI42f%2BbvATkOhZQBrAVX4C0rwKyA1%2BAhI9rx5AC9zECkjjZ%2F5u8BOQ6FlAGsBVfgLSvArIDX4CEj2vHkAL3MQKSONn%2Fm7wE5DoWUAawFV%2BAtK8CsgNfgISPa8eQAvcxApI42f%2BbvATkOhZQBrAVX4C0rwKyA1%2BAhI9rx5AC9zECkjjZ%2F5u8BOQ6FlAGsBVfgLSvArIDX4CEj2vHkAL3MQKSONn%2Fm7wE5DoWUAawFV%2BAtK8CsgNfgISPa8eQAvcxApI42f%2BbvATkOhZQBrAVX4C0rwKyA1%2BAhI9rx5AC9zECkjjZ%2F5u8BOQ6FlAGsBVfgLSvArIDX4CEj2vHkAL3MQKSONn%2Fm7wE5DoWUAawFV%2BAtK8CsgNfgISPa8eQAvcxApI42f%2BbvATkOhZQBrAVX4C0rwKyA1%2BAhI9rx5AC9zECkjjZ%2F5u8BOQ6FlAGsBVfgLSvArIDX4CEj2vHkAL3MQKSONn%2Fm7wE5DoWUAawFV%2BAtK8CsgNfgISPa8eQAvcxApI42f%2BbvATkOhZQBrAVX4C0rwKyA1%2BAhI9rx5AC9zECkjjZ%2F5u8BOQ6FlAGsBVfgLSvArIDX4CEj2vHkAL3MQKSONn%2Fm7wE5DoWUAawFV%2BAtK8CsgNfgISPa8eQAvcxApI42f%2BbvATkOhZQBrAVX4C0rwKyA1%2BAhI9rx5AC9zECkjjZ%2F5u8Ps%2FzoFgOwhcmYAAAAAASUVORK5CYII%3D");
    }

    get #defaultColor (): Color {
        const colors = [
            "#c74440",
            "#2d70b3",
            "#388c46",
            "#fa7e19",
            "#6042a6",
            "#000000"
        ];

        return colors[this.#nextId % colors.length - 1] as Color;
    }

    get #saveRequestBody () {
        return formurlencoded({
            thumb_data: this.#thumbData,
            my_graphs: false,
            is_update: false,
            calc_state: this.#calcState,
            lang: "en",
            product: "graphing",
            graph_hash: this.#graphHash,
        });
    }

    get #nextId () {
        return this.items.length + 1;
    }

    addTex (latex: string, options: Options = { color: this.#defaultColor }) {
        this.items.push({
            type: "expression",
            id: this.#nextId,
            latex,
            ...options,
        });

        return this;
    }

    addExpression (expression: string, options: Options = { color: this.#defaultColor }) {
        this.items.push({
            type: "expression",
            id: this.#nextId,
            latex: texUtil(expression),
            ...options,
        });

        return this;
    }

    addPoint (x: string, y: string, options: Options = { color: this.#defaultColor }) {
        this.items.push({
            type: "expression",
            id: this.#nextId,
            latex: `\\\\left(${texUtil(x)},${texUtil(y)}\\\\right)`,
            ...options,
        });

        return this;
    }

    addLatexPoint (x: string, y: string, options: Options = { color: this.#defaultColor }) {
        this.items.push({
            type: "expression",
            id: this.#nextId,
            latex: `\\\\left(${x},${y}\\\\right)`,
            ...options,
        });

        return this;
    }

    addNote (note: string) {
        this.items.push({
            type: "text",
            id: this.#nextId,
            text: note,
        });

        return this;
    }

    async save () {
        const response = await fetch("https://www.desmos.com/api/v1/calculator/save", {
            "headers": {
              "accept": "application/json, text/javascript, */*; q=0.01",
              "accept-language": "en-US,en;q=0.9",
              "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
              "sec-ch-ua": "\"Not:A-Brand\";v=\"99\", \"Chromium\";v=\"112\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"macOS\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest"
            },
            "referrer": "https://www.desmos.com/calculator",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": this.#saveRequestBody,
            "method": "POST"
        });
          
        const data = await response.json() as DesmosResponse;

        this.url = `https://www.desmos.com/calculator/${data.hash}`;

        return this;
    }
}

export default Graph;