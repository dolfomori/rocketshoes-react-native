import {call, select, put, takeLatest, all} from 'redux-saga/effects';
import {Alert} from 'react-native';

import api from '../../../services/api';
import NavigationService from '../../../services/navigation';

import {formatPrice} from '../../../util/format';
import {addToCartSucess, updateAmountSucess} from './actions';

function* addToCart({id}) {
  const productExists = yield select(state =>
    state.cart.find(p => p.id === id),
  );

  const stock = yield call(api.get, `/stock/${id}`);

  const stockAmount = stock.data.amount;
  const currentAmount = productExists ? productExists.amount : 0;
  const amount = currentAmount + 1;

  if (amount > stockAmount) {
    Alert.alert('Quantidade solicitada fora de estoque');
    return;
  }

  if (productExists) {
    yield put(updateAmountSucess(id, amount));
  } else {
    const response = yield call(api.get, `/products/${id}`);

    const data = {
      ...response.data,
      amount: 1,
      priceFormatted: formatPrice(response.data.price),
    };

    yield put(addToCartSucess(data));
    // history.push('/cart');
    NavigationService.navigate('Cart');
  }
}

function* updateAmount({id, amount}) {
  if (amount <= 0) return;

  const stock = yield call(api.get, `stock/${id}`);
  const stockAmount = stock.data.amount;

  if (amount > stockAmount) {
    Alert.alert('Quantidade solicitada fora de estoque');
    return;
  }

  yield put(updateAmountSucess(id, amount));
}

export default all([
  takeLatest('@cart/ADD_REQUEST', addToCart),
  takeLatest('@cart/UPDATE_AMOUNT_REQUEST', updateAmount),
]);
