import { useBucket } from '@bumble/storage'

interface Store {
  apples: number
  oranges: number
  potatos: number
}

chrome.storage.local.set({
  // To keep track of the bucket items
  'bumble/storage__testBucket_keys': [
    'apples',
    'oranges',
    'potatos',
  ],
  // These are all part of the bucket
  'bumble/storage__testBucket--apples': 5,
  'bumble/storage__testBucket--oranges': 5,
  'bumble/storage__testBucket--potatos': 5,
  // This is not visible from the bucket
  images: 5,
})

const bucket = useBucket<Store>('local', 'testBucket')

/* -------------------------------------------- */
/*                   GET SPECS                  */
/* -------------------------------------------- */

test.todo('get operations', () => {
  bucket.get('apples').then((result) => {
    // TODO: result should be { apples }
  })

  bucket.get('images').then((result) => {
    // TODO: result should be {}
  })

  bucket.get(['apples', 'oranges']).then((result) => {
    // TODO: result should be { apples, oranages }
  })

  bucket.get({ apples: 0, oranges: 0 }).then((result) => {
    // TODO: result should be { apples, oranges }
  })

  bucket
    .get(({ apples, oranges }: Store) => apples + oranges)
    .then((result) => {
      // TODO: result should be 10
    })
})

test.todo('should not be able to get from other bucket')
test.todo('should not be able to get native storage')

/* -------------------------------------------- */
/*                   SET SPECS                  */
/* -------------------------------------------- */

test.todo('single set ops', () => {
  bucket.set({ apples: 6 }).then(() => {
    // TODO: bucket should be { apples: 6, oranges, potatos }
  })
})

test.todo('multiple set ops', () => {
  bucket.set({ apples: 6 }).then(() => {
    // TODO: bucket should be { apples: 7, oranges, potatos }
  })

  bucket
    .set((store: Store) => ({
      // TODO: store.apples should be 6
      ...store,
      apples: store.apples + 1,
    }))
    .then(() => {
      // TODO: bucket should be { apples: 7, oranges, potatos }
    })
})

/* -------------------------------------------- */
/*                 REMOVE SPECS                 */
/* -------------------------------------------- */

test.todo('remove', () => {
  bucket.remove('apples').then(() => {
    // TODO: bucket should be { oranges, potatos }
    chrome.storage.local.get(null, (result) => {
      // TODO: result should be {
      //   "bumble/storage__testBucket_keys": ['oranges', 'potatos'],
      //   "bumble/storage__testBucket--oranges": 5,
      //   "bumble/storage__testBucket--potatos": 5,
      //   "images": 5,
      // }
    })
  })
})

test.todo('should not be able to remove from other bucket')
test.todo('should not be able to remove from native storage')

/* -------------------------------------------- */
/*                  CLEAR SPECS                 */
/* -------------------------------------------- */

test.todo('clear', () => {
  bucket.clear().then(() => {
    // TODO: bucket should be {}
    chrome.storage.local.get(null, (result) => {
      // TODO: result should be {
      //   "bumble/storage__testBucket_keys": [],
      //   "images": 5,
      // }
    })
  })
})

test.todo('should not clear other buckets')
test.todo('should not clear native storage')
