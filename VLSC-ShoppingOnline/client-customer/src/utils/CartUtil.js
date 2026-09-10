const CartUtil = {
  getTotal(mycart) {
    var total = 0;
    if (Array.isArray(mycart)) {
      for (const item of mycart) {
        total += item.product.price * item.quantity;
      }
    }
    return total;
  }
};
export default CartUtil;
