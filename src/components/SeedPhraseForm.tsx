import React, {useRef, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';

import SeedInput from '../ui/SeedInput';

interface SeedPhraseFormProps {
  setFormValue: (value: any[]) => void;
}

const SeedPhraseForm: React.FunctionComponent<SeedPhraseFormProps> = ({
  setFormValue,
}) => {
  const [seedPhrase, setSeedPhrase] = useState<any>([]);
  const wordNumber1 = useRef<TextInput>(null);
  const wordNumber2 = useRef<TextInput>(null);
  const wordNumber3 = useRef<TextInput>(null);
  const wordNumber4 = useRef<TextInput>(null);
  const wordNumber5 = useRef<TextInput>(null);
  const wordNumber6 = useRef<TextInput>(null);
  const wordNumber7 = useRef<TextInput>(null);
  const wordNumber8 = useRef<TextInput>(null);
  const wordNumber9 = useRef<TextInput>(null);
  const wordNumber10 = useRef<TextInput>(null);
  const wordNumber11 = useRef<TextInput>(null);
  const wordNumber12 = useRef<TextInput>(null);

  const onChange = (value: string, i: number) => {
    const index = i - 1;
    const tempSeedPhrase = seedPhrase;
    tempSeedPhrase[index] = value;
    setSeedPhrase(tempSeedPhrase);
    setFormValue(tempSeedPhrase);
  };

  return (
    <View style={styles.seedContainer}>
      <View style={styles.row}>
        <SeedInput
          onChange={onChange}
          width={'28%'}
          number={1}
          value={seedPhrase[0]}
          ref={wordNumber1}
          onSubmit={() => wordNumber2.current?.focus()}
        />
        <SeedInput
          onChange={onChange}
          width={'28%'}
          number={2}
          value={seedPhrase[1]}
          ref={wordNumber2}
          onSubmit={() => wordNumber3.current?.focus()}
        />
        <SeedInput
          onChange={onChange}
          width={'28%'}
          number={3}
          value={seedPhrase[2]}
          ref={wordNumber3}
          onSubmit={() => wordNumber4.current?.focus()}
        />
      </View>

      <View style={styles.row}>
        <SeedInput
          onChange={onChange}
          width={'28%'}
          number={4}
          value={seedPhrase[3]}
          ref={wordNumber4}
          onSubmit={() => wordNumber5.current?.focus()}
        />
        <SeedInput
          onChange={onChange}
          width={'28%'}
          number={5}
          value={seedPhrase[4]}
          ref={wordNumber5}
          onSubmit={() => wordNumber6.current?.focus()}
        />
        <SeedInput
          onChange={onChange}
          width={'28%'}
          number={6}
          value={seedPhrase[5]}
          ref={wordNumber6}
          onSubmit={() => wordNumber7.current?.focus()}
        />
      </View>
      <View style={styles.row}>
        <SeedInput
          onChange={onChange}
          width={'28%'}
          number={7}
          value={seedPhrase[6]}
          ref={wordNumber7}
          onSubmit={() => wordNumber8.current?.focus()}
        />
        <SeedInput
          onChange={onChange}
          width={'28%'}
          number={8}
          value={seedPhrase[7]}
          ref={wordNumber8}
          onSubmit={() => wordNumber9.current?.focus()}
        />
        <SeedInput
          onChange={onChange}
          width={'28%'}
          number={9}
          value={seedPhrase[8]}
          ref={wordNumber9}
          onSubmit={() => wordNumber10.current?.focus()}
        />
      </View>
      <View style={styles.row}>
        <SeedInput
          onChange={onChange}
          width={'28%'}
          number={10}
          value={seedPhrase[9]}
          ref={wordNumber10}
          onSubmit={() => wordNumber11.current?.focus()}
        />
        <SeedInput
          onChange={onChange}
          width={'28%'}
          number={11}
          value={seedPhrase[10]}
          ref={wordNumber11}
          onSubmit={() => wordNumber12.current?.focus()}
        />
        <SeedInput
          onChange={onChange}
          width={'28%'}
          number={12}
          value={seedPhrase[11]}
          ref={wordNumber12}
        />
      </View>
      {/* <View style={styles.row}>
        <SeedInput
          onChange={onChange}
          width={"28%"}
          number={13}
          value={get[12]}
          ref={wordNumber13}
          onSubmit={() => wordNumber14.current?.focus()}
        />
        <SeedInput
          onChange={onChange}
          width={"28%"}
          number={14}
          value={get[13]}
          ref={wordNumber14}
          onSubmit={() => wordNumber15.current?.focus()}
        />
        <SeedInput
          onChange={onChange}
          width={"28%"}
          number={15}
          value={get[14]}
          ref={wordNumber15}
          onSubmit={() =>
            get.length < 15 ? Alert.alert("Error") : Alert.alert("Signup")
          }
        />
      </View> */}
    </View>
  );
};

export default SeedPhraseForm;

const styles = StyleSheet.create({
  seedContainer: {
    flexDirection: 'column',
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
});
