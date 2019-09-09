import { getBasket } from '@bumble/storage'

interface Store {
  apples: number
  oranges: number
  potatos: number
}

chrome.storage.local.set({
  // To keep track of the basket items
  'bumble/storage__testBasket_keys': [
    'apples',
    'oranges',
    'potatos',
  ],
  // These are all part of the basket
  'bumble/storage__testBasket--apples': 5,
  'bumble/storage__testBasket--oranges': 5,
  'bumble/storage__testBasket--potatos': 5,
  // This is not visible from the basket
  images: 5,
})

const basket = getBasket<Store>('local', 'testBasket')

/* -------------------------------------------- */
/*                   GET SPECS                  */
/* -------------------------------------------- */

test.todo('get operations', () => {
  basket.get('apples').then((result) => {
    // TODO: result should be { apples }
  })

  basket.get('images').then((result) => {
    // TODO: result should be {}
  })

  basket.get(['apples', 'oranges']).then((result) => {
    // TODO: result should be { apples, oranages }
  })

  basket.get({ apples: 0, oranges: 0 }).then((result) => {
    // TODO: result should be { apples, oranges }
  })

  basket
    .get(({ apples, oranges }: Store) => apples + oranges)
    .then((result) => {
      // TODO: result should be 10
    })
})

test.todo('should not be able to get from other basket')
test.todo('should not be able to get native storage')

/* -------------------------------------------- */
/*                   SET SPECS                  */
/* -------------------------------------------- */

test.todo('single set ops', () => {
  basket.set({ apples: 6 }).then(() => {
    // TODO: basket should be { apples: 6, oranges, potatos }
  })
})

test.todo('multiple set ops', () => {
  basket.set({ apples: 6 }).then(() => {
    // TODO: basket should be { apples: 7, oranges, potatos }
  })

  basket
    .set((store: Store) => ({
      // TODO: store.apples should be 6
      ...store,
      apples: store.apples + 1,
    }))
    .then(() => {
      // TODO: basket should be { apples: 7, oranges, potatos }
    })
})

/* -------------------------------------------- */
/*                 REMOVE SPECS                 */
/* -------------------------------------------- */

test.todo('remove', () => {
  basket.remove('apples').then(() => {
    // TODO: basket should be { oranges, potatos }
    chrome.storage.local.get(null, (result) => {
      // TODO: result should be {
      //   "bumble/storage__testBasket_keys": ['oranges', 'potatos'],
      //   "bumble/storage__testBasket--oranges": 5,
      //   "bumble/storage__testBasket--potatos": 5,
      //   "images": 5,
      // }
    })
  })
})

test.todo('should not be able to remove from other basket')
test.todo('should not be able to remove from native storage')

/* -------------------------------------------- */
/*                  CLEAR SPECS                 */
/* -------------------------------------------- */

test.todo('clear', () => {
  basket.clear().then(() => {
    // TODO: basket should be {}
    chrome.storage.local.get(null, (result) => {
      // TODO: result should be {
      //   "bumble/storage__testBasket_keys": [],
      //   "images": 5,
      // }
    })
  })
})

test.todo('should not clear other baskets')
test.todo('should not clear native storage')
