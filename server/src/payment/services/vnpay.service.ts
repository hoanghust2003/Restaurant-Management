import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as querystring from 'qs';
import { vnpayConfig } from '../../config/vnpay.config';

@Injectable()
export class VnpayService {
  private generatePaymentUrl(
    amount: number,
    orderId: string,
    orderInfo: string,
    ipAddr: string,
  ): string {
    const date = new Date();
    const createDate = date.toISOString().split('T')[0].split('-').join('') + 
                      date.toTimeString().split(' ')[0].split(':').join('');

    const currCode = 'VND';
    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayConfig.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100, // Convert to VND cents
      vnp_ReturnUrl: vnpayConfig.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    const sortedParams = this.sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpayConfig.hashSecret);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

    sortedParams['vnp_SecureHash'] = signed;
    const paymentUrl = vnpayConfig.url + '?' + querystring.stringify(sortedParams, { encode: false });
    
    return paymentUrl;
  }

  createPaymentUrl(
    amount: number,
    orderId: string,
    orderInfo: string,
    ipAddr: string,
  ): string {
    return this.generatePaymentUrl(amount, orderId, orderInfo, ipAddr);
  }

  verifyReturnUrl(vnpParams: any): boolean {
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpayConfig.hashSecret);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
  }

  private sortObject(obj: any): any {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    
    for (const key of keys) {
      if (obj.hasOwnProperty(key)) {
        sorted[key] = obj[key];
      }
    }
    
    return sorted;
  }
}
